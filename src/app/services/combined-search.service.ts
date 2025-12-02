import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { GoogleBooksService, BookSearchResult as GoogleBookResult } from './google-books.service';

export interface OpenLibraryVolume {
  key: string;
  title?: string;
  author_name?: string[];
  isbn?: string[];
  first_publish_year?: number;
  number_of_pages?: number;
  cover_i?: number;
  first_sentence?: string;
}

export interface OpenLibraryResponse {
  docs?: OpenLibraryVolume[];
}

export interface CombinedSearchResult extends GoogleBookResult {
  source?: 'google' | 'openlibrary' | 'combined';
  completeness?: number; // Puntuación de cuán completos están los datos
}

@Injectable({
  providedIn: 'root'
})
export class CombinedSearchService {
  private readonly OPENLIBRARY_URL = 'https://openlibrary.org/search.json';

  constructor(
    private googleBooksService: GoogleBooksService,
    private http: HttpClient
  ) { }

  /**
   * Busca en ambas APIs (Google Books y OpenLibrary)
   * y retorna los resultados más completos
   */
  searchBothLibraries(query: string): Observable<CombinedSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    return this.googleBooksService.searchBooks(query).pipe(
      catchError(() => of([])),
      switchMap((googleResults) => {
        if (googleResults && googleResults.length > 0) {
          // Si Google encuentra resultados, los usamos y no buscamos en OpenLibrary
          const mappedResults: CombinedSearchResult[] = googleResults.map((r) => ({
            ...r,
            source: 'google' as const,
            completeness: this.calculateCompleteness(r as CombinedSearchResult)
          }));
          return of(mappedResults.sort((a, b) => (b.completeness || 0) - (a.completeness || 0)));
        } else {
          // Si Google no encuentra nada, buscamos en OpenLibrary
          return this.searchOpenLibrary(query).pipe(
            map(results => results.sort((a, b) => (b.completeness || 0) - (a.completeness || 0)))
          );
        }
      })
    );
  }

  /**
   * Busca en OpenLibrary
   */
  private searchOpenLibrary(query: string): Observable<CombinedSearchResult[]> {
    return this.http
      .get<OpenLibraryResponse>(this.OPENLIBRARY_URL, {
        params: { q: query, limit: 10 }
      })
      .pipe(
        map((response) => {
          if (!response.docs) {
            return [];
          }
          return response.docs.map((doc) => this.mapOpenLibraryVolume(doc));
        }),
        catchError(() => of([]))
      );
  }

  /**
   * Mapea un volumen de OpenLibrary a CombinedSearchResult
   */
  private mapOpenLibraryVolume(volume: OpenLibraryVolume): CombinedSearchResult {
    const result: CombinedSearchResult = {
      title: volume.title,
      author: volume.author_name?.[0],
      isbn: volume.isbn?.[0],
      pages: volume.number_of_pages,
      description: volume.first_sentence,
      source: 'openlibrary',
      coverImageUrl: volume.cover_i
        ? `https://covers.openlibrary.org/b/id/${volume.cover_i}-M.jpg`
        : undefined
    };

    result.completeness = this.calculateCompleteness(result);
    return result;
  }

  /**
   * Fusiona resultados de ambas APIs
   * Si hay duplicados por título+autor, usa el más completo
   */
  private mergeResults(
    googleResults: GoogleBookResult[],
    olResults: CombinedSearchResult[]
  ): CombinedSearchResult[] {
    const allResults: CombinedSearchResult[] = [
      ...googleResults.map((r) => ({
        ...r,
        source: 'google' as const,
        completeness: this.calculateCompleteness(r)
      })),
      ...olResults
    ];

    const merged = new Map<string, CombinedSearchResult>();

    for (const result of allResults) {
      const key = this.getResultKey(result);
      const existing = merged.get(key);

      if (!existing) {
        merged.set(key, result);
      } else {
        // Si ya existe, mantener el más completo
        const existingCompleteness = existing.completeness || 0;
        const newCompleteness = result.completeness || 0;

        if (newCompleteness > existingCompleteness) {
          merged.set(key, result);
        }
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Calcula un score de completitud basado en cuántos campos tienen datos
   */
  private calculateCompleteness(result: CombinedSearchResult): number {
    let score = 0;
    const maxScore = 6;

    if (result.title) score++;
    if (result.author) score++;
    if (result.isbn) score++;
    if (result.pages) score++;
    if (result.description) score++;
    if (result.coverImageUrl) score++;

    return (score / maxScore) * 100;
  }

  /**
   * Genera una clave única para deduplicación
   */
  private getResultKey(result: CombinedSearchResult): string {
    const title = (result.title || '').toLowerCase().trim();
    const author = (result.author || '').toLowerCase().trim();
    return `${title}|${author}`;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OpenLibraryBook, SearchResult } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class OpenLibraryService {
  private readonly API_BASE_URL = 'https://openlibrary.org/search.json';

  constructor(private http: HttpClient) {}

  searchBooks(query: string): Observable<OpenLibraryBook[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    return this.http
      .get<SearchResult>(this.API_BASE_URL, {
        params: { q: query, limit: 10 }
      })
      .pipe(
        map((result) => result.docs || []),
        catchError(() => {
          console.error('Error searching OpenLibrary API');
          return of([]);
        })
      );
  }

  searchByTitle(title: string): Observable<OpenLibraryBook[]> {
    return this.searchBooks(`title:"${title}"`);
  }

  searchByAuthor(author: string): Observable<OpenLibraryBook[]> {
    return this.searchBooks(`author:"${author}"`);
  }

  searchByISBN(isbn: string): Observable<OpenLibraryBook[]> {
    return this.searchBooks(`isbn:"${isbn}"`);
  }

  getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  }
}

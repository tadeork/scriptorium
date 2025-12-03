import { Injectable, inject } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Functions, httpsCallable } from '@angular/fire/functions';

export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    isbn?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    description?: string;
    pageCount?: number;
    publishedDate?: string;
  };
}

export interface GoogleBooksResponse {
  items?: GoogleBooksVolume[];
  totalItems: number;
}

export interface BookSearchResult {
  title?: string;
  author?: string;
  isbn?: string;
  coverImageUrl?: string;
  description?: string;
  pages?: number;
  publishedDate?: string;
}


@Injectable({
  providedIn: 'root'
})
export class GoogleBooksService {
  private readonly FUNCTION_NAME = 'searchBooks';
  private functions: Functions = inject(Functions);

  constructor() { }

  searchBooks(query: string): Observable<BookSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    const searchBooksFn = httpsCallable(this.functions, this.FUNCTION_NAME);

    // httpsCallable returns a Promise, so we convert it to an Observable with from()
    // The Cloud Function expects { query } in request.data
    return from(searchBooksFn({ query })).pipe(
      map((result: any) => {
        // The Cloud Function returns the Google Books API response in result.data
        const response = result.data;
        if (!response.items) {
          return [];
        }
        return response.items.map((item: any) => this.mapVolumeToResult(item));
      }),
      catchError((error) => {
        console.error('Error searching Google Books via Firebase Function', error);
        return of([]);
      })
    );
  }

  searchByTitle(title: string): Observable<BookSearchResult[]> {
    return this.searchBooks(`intitle:${title}`);
  }

  searchByAuthor(author: string): Observable<BookSearchResult[]> {
    return this.searchBooks(`inauthor:${author}`);
  }

  searchByISBN(isbn: string): Observable<BookSearchResult[]> {
    return this.searchBooks(`isbn:${isbn}`);
  }

  private mapVolumeToResult(volume: GoogleBooksVolume): BookSearchResult {
    const info = volume.volumeInfo;
    let coverImageUrl: string | undefined;

    // Intentar obtener la imagen de mejor calidad
    if (info.imageLinks?.thumbnail) {
      coverImageUrl = info.imageLinks.thumbnail.replace('http://', 'https://');
    } else if (info.imageLinks?.smallThumbnail) {
      coverImageUrl = info.imageLinks.smallThumbnail.replace('http://', 'https://');
    }

    return {
      title: info.title,
      author: info.authors?.[0],
      isbn: info.isbn,
      coverImageUrl,
      description: info.description,
      pages: info.pageCount,
      publishedDate: info.publishedDate
    };
  }
}

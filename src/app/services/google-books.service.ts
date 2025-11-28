import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
  private readonly API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
  private readonly API_KEY = 'AIzaSyBS2xIQ12CTLHdrwzkTbFaWhqmtKBPLmGc';

  constructor(private http: HttpClient) {}

  searchBooks(query: string): Observable<BookSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return of([]);
    }

    const params = {
      q: query,
      maxResults: '10',
      key: this.API_KEY
    };

    return this.http.get<GoogleBooksResponse>(this.API_BASE_URL, { params }).pipe(
      map((response) => {
        if (!response.items) {
          return [];
        }
        return response.items.map((item) => this.mapVolumeToResult(item));
      }),
      catchError(() => {
        console.error('Error searching Google Books API');
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

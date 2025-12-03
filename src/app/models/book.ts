export type BookStatus = 'read' | 'reading' | 'to-read' | 'not-interested' | 'borrowed';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  coverImageUrl?: string;
  collection?: 'library' | 'wishlist';
  status: BookStatus;
  pagesRead?: number; // páginas leídas (no porcentaje)
  pages?: number;
  publishedDate?: string;
  description?: string;
  format?: 'physical' | 'digital';
  createdAt: number;
  updatedAt: number;
}

export interface OpenLibraryBook {
  title?: string;
  author_name?: string[];
  isbn?: string[];
  first_publish_year?: number;
  cover_id?: number;
  key?: string;
  edition_count?: number;
}

export interface SearchResult {
  docs: OpenLibraryBook[];
  numFound: number;
}

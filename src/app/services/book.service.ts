import { Injectable, signal } from '@angular/core';
import { Book, BookStatus } from '../models/book';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private books = signal<Book[]>([]);

  readonly books$ = this.books.asReadonly();

  constructor(private storageService: LocalStorageService) {
    this.loadBooks();
  }

  private loadBooks(): void {
    const stored = this.storageService.loadBooks();
    this.books.set(stored);
  }

  addBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Book {
    const newBook: Book = {
      ...book,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const currentBooks = this.books();
    this.books.set([...currentBooks, newBook]);
    this.saveBooksToStorage();
    return newBook;
  }

  updateBook(id: string, updates: Partial<Book>): void {
    const currentBooks = this.books();
    const index = currentBooks.findIndex((b) => b.id === id);

    if (index !== -1) {
      const updated = {
        ...currentBooks[index],
        ...updates,
        updatedAt: Date.now()
      };
      const newBooks = [...currentBooks];
      newBooks[index] = updated;
      this.books.set(newBooks);
      this.saveBooksToStorage();
    }
  }

  deleteBook(id: string): void {
    const currentBooks = this.books();
    const filtered = currentBooks.filter((b) => b.id !== id);
    this.books.set(filtered);
    this.saveBooksToStorage();
  }

  getBookById(id: string): Book | undefined {
    return this.books().find((b) => b.id === id);
  }

  getBooksByStatus(status: BookStatus): Book[] {
    return this.books().filter((b) => b.status === status);
  }

  searchBooks(query: string): Book[] {
    const lowerQuery = query.toLowerCase();
    return this.books().filter(
      (b) =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.author.toLowerCase().includes(lowerQuery) ||
        (b.isbn && b.isbn.includes(lowerQuery))
    );
  }

  updateProgress(id: string, pagesRead: number): void {
    const book = this.getBookById(id);
    if (book && book.pages) {
      const clamped = Math.max(0, Math.min(book.pages, pagesRead));
      this.updateBook(id, { pagesRead: clamped });
    }
  }

  incrementPages(id: string, increment: number = 1): void {
    const book = this.getBookById(id);
    if (book) {
      const currentPages = book.pagesRead || 0;
      this.updateProgress(id, currentPages + increment);
    }
  }

  importBooks(newBooks: Book[]): void {
    const currentBooks = this.books();
    const bookMap = new Map(currentBooks.map((b) => [b.id, b]));

    newBooks.forEach((book) => {
      // Ensure required fields are present
      if (!book.id) {
        book.id = this.generateId();
      }
      if (!book.createdAt) {
        book.createdAt = Date.now();
      }
      book.updatedAt = Date.now();
      
      bookMap.set(book.id, book);
    });

    this.books.set(Array.from(bookMap.values()));
    this.saveBooksToStorage();
  }

  private saveBooksToStorage(): void {
    this.storageService.saveBooks(this.books());
  }

  private generateId(): string {
    return `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

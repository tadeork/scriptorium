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

  updateProgress(id: string, progress: number): void {
    const clamped = Math.max(0, Math.min(100, progress));
    this.updateBook(id, { readProgress: clamped });
  }

  incrementProgress(id: string, increment: number = 1): void {
    const book = this.getBookById(id);
    if (book) {
      const currentProgress = book.readProgress || 0;
      this.updateProgress(id, currentProgress + increment);
    }
  }

  private saveBooksToStorage(): void {
    this.storageService.saveBooks(this.books());
  }

  private generateId(): string {
    return `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

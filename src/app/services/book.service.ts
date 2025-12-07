import { Injectable, signal } from '@angular/core';
import { Book, BookStatus } from '../models/book';
import { LocalStorageService } from './local-storage.service';
import { CollectionService } from './collection.service';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private books = signal<Book[]>([]);

  readonly books$ = this.books.asReadonly();

  constructor(
    private storageService: LocalStorageService,
    private collectionService: CollectionService
  ) {
    this.loadBooks();
  }

  private loadBooks(): void {
    const stored = this.storageService.loadBooks();

    // Process categories and ownership
    let hasChanges = false;
    const updatedBooks = stored.map(book => {
      let modifiedBook = { ...book };
      let changed = false;

      // Sync category to customCollections
      if (book.category) {
        // Ensure category exists as a collection
        this.collectionService.addCollection(book.category);

        // Add to customCollections if not present
        if (!book.customCollections?.includes(book.category)) {
          modifiedBook.customCollections = [...(book.customCollections || []), book.category];
          changed = true;
        }
      }

      if (changed) {
        hasChanges = true;
        return modifiedBook;
      }
      return book;
    });

    if (hasChanges) {
      this.books.set(updatedBooks);
      this.saveBooksToStorage();
    } else {
      this.books.set(stored);
    }
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

  addBookToCollection(bookId: string, collectionName: string): void {
    const book = this.getBookById(bookId);
    if (book) {
      const currentCollections = book.customCollections || [];
      if (!currentCollections.includes(collectionName)) {
        this.updateBook(bookId, { customCollections: [...currentCollections, collectionName] });
      }
    }
  }

  removeBookFromCollection(bookId: string, collectionName: string): void {
    const book = this.getBookById(bookId);
    if (book && book.customCollections) {
      const updatedCollections = book.customCollections.filter(c => c !== collectionName);
      this.updateBook(bookId, { customCollections: updatedCollections });
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

    // Sync collections from imported books
    newBooks.forEach(book => {
      if (book.category) {
        this.collectionService.addCollection(book.category);
      }
      if (book.customCollections) {
        book.customCollections.forEach(c => this.collectionService.addCollection(c));
      }
    });
  }

  private saveBooksToStorage(): void {
    this.storageService.saveBooks(this.books());
  }

  private generateId(): string {
    return `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  checkDuplicate(title: string, author: string, isbn?: string): boolean {
    const lowerTitle = title.toLowerCase().trim();
    const lowerAuthor = author.toLowerCase().trim();
    // Remove dashes for ISBN comparison if present
    const cleanIsbn = isbn ? isbn.replace(/-/g, '').trim() : '';

    return this.books().some((book) => {
      // Check ISBN if available on both sides
      if (cleanIsbn && book.isbn) {
        const bookIsbn = book.isbn.replace(/-/g, '').trim();
        if (bookIsbn === cleanIsbn) return true;
      }

      // Check Title and Author
      const bookTitle = book.title.toLowerCase().trim();
      const bookAuthor = book.author.toLowerCase().trim();

      return bookTitle === lowerTitle && bookAuthor === lowerAuthor;
    });
  }

  renameCollection(oldName: string, newName: string): void {
    const currentBooks = this.books();
    const updatedBooks = currentBooks.map(book => {
      if (book.customCollections?.includes(oldName)) {
        const updatedCollections = book.customCollections.map(c => c === oldName ? newName : c);
        return { ...book, customCollections: updatedCollections, updatedAt: Date.now() };
      }
      return book;
    });

    if (JSON.stringify(currentBooks) !== JSON.stringify(updatedBooks)) {
      this.books.set(updatedBooks);
      this.saveBooksToStorage();
    }
  }

  updateCollectionMembership(collectionName: string, bookIds: string[]): void {
    const currentBooks = this.books();
    const targetIds = new Set(bookIds);

    const updatedBooks = currentBooks.map(book => {
      const isInCollection = book.customCollections?.includes(collectionName);
      const shouldBeInCollection = targetIds.has(book.id);

      if (isInCollection && !shouldBeInCollection) {
        // Remove from collection
        return {
          ...book,
          customCollections: book.customCollections?.filter(c => c !== collectionName) || [],
          updatedAt: Date.now()
        };
      } else if (!isInCollection && shouldBeInCollection) {
        // Add to collection
        return {
          ...book,
          customCollections: [...(book.customCollections || []), collectionName],
          updatedAt: Date.now()
        };
      }
      return book;
    });

    if (JSON.stringify(currentBooks) !== JSON.stringify(updatedBooks)) {
      this.books.set(updatedBooks);
      this.saveBooksToStorage();
    }
  }
}

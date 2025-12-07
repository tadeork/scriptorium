import { Component, EventEmitter, Output, inject, signal, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../../services/collection.service';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';

@Component({
  selector: 'app-collection-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (showTitle) {
    <h2 class="form-title">Nueva Categoría</h2>
    }
    <div class="form-group">
      <label class="form-label">Nombre *</label>
      <input type="text" [(ngModel)]="collectionName" class="form-input" placeholder="Ej. Novelas, Terror, Favoritos..." (keyup.enter)="create()">
      @if (errorMessage()) {
        <div class="error-message">{{ errorMessage() }}</div>
      }
    </div>

    <div class="form-group">
      <label class="form-label">Seleccionar Libros</label>
      <input type="text" [(ngModel)]="bookSearchQuery" (input)="filterBooks()"
        placeholder="Buscar por título..." class="form-input mb-2" />

      <div class="books-selection-list">
        @if (filteredBooks.length === 0) {
        <p class="no-books-msg">No se encontraron libros.</p>
        }

        @for (book of filteredBooks; track book.id) {
        <div class="book-select-item" [class.selected]="isBookSelected(book.id)"
          (click)="toggleBookSelection(book.id)">
          <input type="checkbox" [checked]="isBookSelected(book.id)" (click)="$event.stopPropagation()"
            (change)="toggleBookSelection(book.id)" class="book-checkbox">
          <div class="book-info">
            <span class="book-title">{{ book.title }}</span>
            <span class="book-author">{{ book.author }}</span>
          </div>
        </div>
        }
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-primary" (click)="create()" [disabled]="!collectionName.trim()">CREAR</button>
    </div>
  `,
  styles: [`
    .form-title {
      font-size: 1.5rem;
      font-weight: 900;
      margin: 0 0 1.5rem 0;
      text-transform: uppercase;
      color: #212121;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 1px solid #212121;
      background-color: #fff;
      box-sizing: border-box;
      transition: all 0.2s;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #d32f2f;
        box-shadow: 4px 4px 0 rgba(211, 47, 47, 0.2);
      }
    }

    .mb-2 {
      margin-bottom: 0.5rem;
    }

    .error-message {
      color: #d32f2f;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      font-weight: 600;
    }

    .books-selection-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      padding: 0.5rem;
      background-color: #f9f9f9;
    }

    .no-books-msg {
      text-align: center;
      color: #757575;
      font-style: italic;
      padding: 1rem;
      margin: 0;
    }

    .book-select-item {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background-color 0.2s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #eee;
      }

      &.selected {
        background-color: #e3f2fd;
      }
    }

    .book-checkbox {
      margin-right: 0.75rem;
      width: 1.2rem;
      height: 1.2rem;
      cursor: pointer;
      accent-color: #212121;
    }

    .book-info {
      display: flex;
      flex-direction: column;
    }

    .book-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: #212121;
    }

    .book-author {
      font-size: 0.85rem;
      color: #757575;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      font-weight: 700;
      text-transform: uppercase;
      cursor: pointer;
      border: 1px solid #212121;
      font-size: 1rem;
      transition: all 0.2s;
      font-family: inherit;
    }

    .btn-primary {
      background-color: #212121;
      color: #fff;
      box-shadow: 4px 4px 0 rgba(0,0,0,0.2);

      &:hover:not(:disabled) {
        transform: translate(-2px, -2px);
        box-shadow: 6px 6px 0 rgba(0,0,0,0.3);
      }

      &:active:not(:disabled) {
        transform: translate(0, 0);
        box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
      }
    }
  `]
})
export class CollectionFormComponent implements OnInit {
  @Input() showTitle = true;
  @Output() collectionCreated = new EventEmitter<void>();

  collectionName = '';
  errorMessage = signal('');

  bookSearchQuery = '';
  availableBooks: Book[] = [];
  filteredBooks: Book[] = [];
  selectedBookIds: Set<string> = new Set();

  private collectionService = inject(CollectionService);
  private bookService = inject(BookService);

  ngOnInit(): void {
    this.loadAvailableBooks();
  }

  loadAvailableBooks(): void {
    this.availableBooks = this.bookService.books$();
    this.filterBooks();
  }

  filterBooks(): void {
    if (!this.bookSearchQuery.trim()) {
      this.filteredBooks = this.availableBooks;
    } else {
      const query = this.bookSearchQuery.toLowerCase();
      this.filteredBooks = this.availableBooks.filter(book =>
        book.title.toLowerCase().includes(query)
      );
    }
  }

  toggleBookSelection(bookId: string): void {
    if (this.selectedBookIds.has(bookId)) {
      this.selectedBookIds.delete(bookId);
    } else {
      this.selectedBookIds.add(bookId);
    }
  }

  isBookSelected(bookId: string): boolean {
    return this.selectedBookIds.has(bookId);
  }

  create(): void {
    if (!this.collectionName.trim()) return;

    const collectionName = this.collectionName.trim();
    const success = this.collectionService.addCollection(collectionName);

    if (success) {
      // Add selected books to the new collection
      this.selectedBookIds.forEach(bookId => {
        this.bookService.addBookToCollection(bookId, collectionName);
      });

      this.collectionCreated.emit();
      this.collectionName = '';
      this.selectedBookIds.clear();
      this.errorMessage.set('');
    } else {
      this.errorMessage.set('Esta categoría ya existe.');
    }
  }
}

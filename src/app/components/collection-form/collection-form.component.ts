import { Component, EventEmitter, Output, inject, signal, OnInit, Input, OnChanges, SimpleChanges, effect } from '@angular/core';
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
    <h2 class="form-title">{{ editingCollectionName ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
    }
    <div class="form-group">
      <label class="form-label">Nombre *</label>
      <input type="text" [(ngModel)]="collectionName" class="form-input" placeholder="Ej. Novelas, Terror, Favoritos..." (keyup.enter)="save()" maxlength="30">
      <div class="char-counter">{{ collectionName.length }}/30</div>
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
            <span class="book-title">
              {{ book.title }}
              @if (book.collection === 'wishlist') {
                <span class="tag-wishlist">Deseado</span>
              }
            </span>
            <span class="book-author">{{ book.author }}</span>
          </div>
        </div>
        }
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-primary" (click)="save()" [disabled]="!collectionName.trim()">{{ editingCollectionName ? 'GUARDAR' : 'CREAR' }}</button>
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

    .char-counter {
      text-align: right;
      font-size: 0.75rem;
      color: #757575;
      margin-top: 0.25rem;
    }

    .books-selection-list {
      max-height: 50vh;
      min-height: 200px;
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

    .tag-wishlist {
      display: inline-block;
      background-color: #f5f5f5; /* Light gray background */
      color: #757575; /* Gray text */
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid #e0e0e0;
      align-self: flex-start;
    }
  `]
})
export class CollectionFormComponent implements OnInit, OnChanges {
  @Input() showTitle = true;
  @Input() editingCollectionName: string | null = null;
  @Output() collectionCreated = new EventEmitter<void>();
  @Output() collectionUpdated = new EventEmitter<string>();

  collectionName = '';
  errorMessage = signal('');

  bookSearchQuery = '';
  availableBooks: Book[] = [];
  filteredBooks: Book[] = [];
  selectedBookIds: Set<string> = new Set();

  private collectionService = inject(CollectionService);
  private bookService = inject(BookService);

  constructor() {
    effect(() => {
      // Reactively update available books when the source signal changes
      this.availableBooks = this.bookService.books$();
      this.filterBooks();
    });
  }

  ngOnInit(): void {
    // Initial load handled by effect, but loadCollectionData needs to run once if editing
    if (this.editingCollectionName) {
      this.loadCollectionData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingCollectionName']) {
      if (this.editingCollectionName) {
        this.loadCollectionData();
      } else {
        this.resetForm();
      }
    }
  }

  loadAvailableBooks(): void {
    this.availableBooks = this.bookService.books$();
    this.filterBooks();
  }

  loadCollectionData(): void {
    if (!this.editingCollectionName) return;
    this.collectionName = this.editingCollectionName;

    // Pre-select books in this collection
    const booksInCollection = this.availableBooks.filter(b =>
      b.customCollections?.includes(this.editingCollectionName!)
    );
    this.selectedBookIds = new Set(booksInCollection.map(b => b.id));
    this.filterBooks();
  }

  resetForm(): void {
    this.collectionName = '';
    this.selectedBookIds.clear();
    this.errorMessage.set('');
    this.bookSearchQuery = '';
    this.filterBooks();
  }

  filterBooks(): void {
    let matches: Book[] = [];

    if (!this.bookSearchQuery.trim()) {
      matches = [...this.availableBooks];
    } else {
      const query = this.bookSearchQuery.toLowerCase();
      matches = this.availableBooks.filter(book =>
        book.title.toLowerCase().includes(query)
      );
    }

    // Sort: Selected first, then by title
    this.filteredBooks = matches.sort((a, b) => {
      const aSelected = this.isBookSelected(a.id);
      const bSelected = this.isBookSelected(b.id);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.title.localeCompare(b.title);
    });
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

  save(): void {
    if (!this.collectionName.trim()) return;
    const newName = this.collectionName.trim();
    const oldName = this.editingCollectionName;

    if (oldName) {
      // Editing existing collection
      if (newName !== oldName) {
        const renamed = this.collectionService.renameCollection(oldName, newName);
        if (!renamed) {
          this.errorMessage.set('Ya existe una categoría con este nombre.');
          return;
        }
        this.bookService.renameCollection(oldName, newName);
      }

      // Update book membership
      this.bookService.updateCollectionMembership(newName, Array.from(this.selectedBookIds));
      this.collectionUpdated.emit(newName);

    } else {
      // Creating new collection
      const success = this.collectionService.addCollection(newName);

      if (success) {
        this.selectedBookIds.forEach(bookId => {
          this.bookService.addBookToCollection(bookId, newName);
        });
        this.collectionCreated.emit();
        this.resetForm();
      } else {
        this.errorMessage.set('Esta categoría ya existe.');
      }
    }
  }
}

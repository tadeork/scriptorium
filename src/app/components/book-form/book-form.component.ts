import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Book } from '../../models/book';
import { CombinedSearchService, CombinedSearchResult } from '../../services/combined-search.service';
import { BookService } from '../../services/book.service';
import { CollectionService } from '../../services/collection.service';
import { debounceTime, Subject, switchMap, tap } from 'rxjs';
import { SearchButtonComponent } from '../search-button/search-button.component';
import { BookItemComponent } from '../book-item/book-item.component';
import { StatusSelectorComponent } from '../status-selector/status-selector.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SearchButtonComponent,
    BookItemComponent,
    StatusSelectorComponent,
    ProgressBarComponent
  ],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.scss'
})
export class BookFormComponent implements OnInit, OnChanges {
  @Input() editingBook: Book | null = null;
  @Input() defaultCollection: 'library' | 'wishlist' = 'library';
  @Input() initialTitle = '';
  @Output() bookAdded = new EventEmitter<Omit<Book, 'id' | 'createdAt' | 'updatedAt'>>();
  @Output() bookUpdated = new EventEmitter<Book>();

  // Exponer parseInt y Math para usarlos en el template
  parseInt = parseInt;
  Math = Math;

  // Tabs
  currentTab: 'book' | 'collection' = 'book';

  // Book Form Fields
  title = '';
  author = '';
  isbn = '';
  pages = '';
  description = '';
  coverImageUrl = '';
  format: 'physical' | 'digital' = 'physical';
  collection: 'library' | 'wishlist' = 'library';
  status: 'read' | 'reading' | 'to-read' | 'not-interested' | 'borrowed' = 'to-read';
  pagesRead = 0;
  borrowedBy = '';

  // Collection Form Fields
  newCollectionName = '';
  availableBooks: Book[] = [];
  selectedBookIds: Set<string> = new Set();
  filteredBooks: Book[] = [];
  bookSearchQuery = '';

  suggestions: CombinedSearchResult[] = [];
  showSuggestions = false;
  searchQuery$ = new Subject<string>();
  isSearching = false;
  searchError = false;
  noResultsMessage = '';

  constructor(
    private combinedSearchService: CombinedSearchService,
    private cdr: ChangeDetectorRef,
    private bookService: BookService,
    private collectionService: CollectionService
  ) { }

  ngOnInit(): void {
    if (this.editingBook) {
      this.loadBookData();
    } else {
      this.collection = this.defaultCollection;
      if (this.initialTitle) {
        this.title = this.initialTitle;
      }
    }

    this.loadAvailableBooks();

    this.searchQuery$
      .pipe(
        debounceTime(300),
        tap(() => {
          this.searchError = false;
          this.noResultsMessage = '';
          // Note: isSearching is already set to true in searchLibrary()
        }),
        switchMap((query) => {
          if (!query.trim()) {
            return [];
          }
          return this.combinedSearchService.searchBothLibraries(query);
        })
      )
      .subscribe((results) => {
        this.isSearching = false;

        if (results.length === 0) {
          this.searchError = true;
          this.noResultsMessage = 'No se encontraron coincidencias en la búsqueda';
          this.suggestions = [];
          this.showSuggestions = false;
        } else {
          // Priorizar resultados con imágenes
          const resultsWithImages = results.filter(r => r.coverImageUrl);
          const resultsWithoutImages = results.filter(r => !r.coverImageUrl);

          this.suggestions = [...resultsWithImages, ...resultsWithoutImages];

          this.searchError = false;
          this.noResultsMessage = '';
          this.showSuggestions = true;
          this.cdr.detectChanges(); // Force view update
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingBook'] && !changes['editingBook'].firstChange) {
      if (this.editingBook) {
        this.loadBookData();
      } else {
        this.resetForm();
      }
    }
    if (changes['defaultCollection']) {
      if (!this.editingBook) {
        this.collection = this.defaultCollection;
      }
    }
    if (changes['initialTitle'] && !this.editingBook) {
      this.title = this.initialTitle;
    }
  }

  private loadBookData(): void {
    if (!this.editingBook) return;
    this.title = this.editingBook.title;
    this.author = this.editingBook.author;
    this.isbn = this.editingBook.isbn || '';
    this.pages = this.editingBook.pages?.toString() || '';
    this.description = this.editingBook.description || '';
    this.coverImageUrl = this.editingBook.coverImageUrl || '';
    this.collection = this.editingBook.collection || 'library';
    this.status = this.editingBook.status;
    this.format = this.editingBook.format || 'physical';
    this.pagesRead = this.editingBook.pagesRead || 0;
    this.borrowedBy = this.editingBook.borrowedBy || '';
  }

  loadAvailableBooks(): void {
    // Load all books from library to show in collection tab
    // We subscribe to the signal to get current value
    this.availableBooks = this.bookService.books$();
    this.filterBooks();
  }

  filterBooks(): void {
    if (!this.bookSearchQuery.trim()) {
      this.filteredBooks = this.availableBooks;
    } else {
      const query = this.bookSearchQuery.toLowerCase();
      this.filteredBooks = this.availableBooks.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
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

  createCollection(): void {
    if (!this.newCollectionName.trim()) {
      alert('Por favor ingresa un nombre para la colección');
      return;
    }

    const success = this.collectionService.addCollection(this.newCollectionName.trim());
    if (!success) {
      alert('Ya existe una colección con ese nombre');
      return;
    }

    // Add selected books to the new collection
    this.selectedBookIds.forEach(bookId => {
      this.bookService.addBookToCollection(bookId, this.newCollectionName.trim());
    });

    alert(`Colección "${this.newCollectionName}" creada con éxito!`);
    this.newCollectionName = '';
    this.selectedBookIds.clear();
    // Maybe switch back to book tab or close modal? For now stay here.
  }

  get isSearchButtonDisabled(): boolean {
    return !this.title.trim() || !this.author.trim() || this.isSearching;
  }

  searchLibrary(): void {
    // Búsqueda manual con los valores actuales de título y autor
    if (!this.title.trim() || !this.author.trim()) {
      alert('Por favor ingresa el título y el autor para buscar');
      return;
    }
    const searchQuery = `${this.title.trim()} ${this.author.trim()}`;
    this.isSearching = true; // Set loading state immediately
    this.searchQuery$.next(searchQuery);
  }

  selectSuggestion(suggestion: CombinedSearchResult): void {
    this.title = suggestion.title || this.title;
    this.author = suggestion.author || this.author;
    if (suggestion.isbn) {
      this.isbn = suggestion.isbn;
    }
    if (suggestion.description) {
      this.description = suggestion.description;
    }
    if (suggestion.pages) {
      this.pages = suggestion.pages.toString();
    }
    if (suggestion.coverImageUrl) {
      this.coverImageUrl = suggestion.coverImageUrl;
    }

    this.showSuggestions = false;
    this.suggestions = [];
  }

  clearSuggestions(): void {
    this.showSuggestions = false;
    this.suggestions = [];
  }

  onProgressIncrement(): void {
    if (!this.pages) return;

    // Cambiar estado automáticamente a "reading" si está en "to-read"
    if (this.status === 'to-read') {
      this.status = 'reading';
    }

    const maxPages = parseInt(this.pages);
    this.pagesRead = Math.min(maxPages, this.pagesRead + 1);
  }

  onProgressDecrement(): void {
    if (!this.pages) return;

    this.pagesRead = Math.max(0, this.pagesRead - 1);
  }

  moveToLibrary(): void {
    this.collection = 'library';
    this.status = 'to-read'; // Default status when moving to library
  }

  onSubmit(targetCollection?: 'library' | 'wishlist'): void {
    if (targetCollection) {
      this.collection = targetCollection;
    }

    if (!this.title.trim() || !this.author.trim()) {
      alert('Por favor completa al menos el título y el autor');
      return;
    }

    // Check for duplicates only when adding a new book
    if (!this.editingBook) {
      const isDuplicate = this.bookService.checkDuplicate(
        this.title.trim(),
        this.author.trim(),
        this.isbn.trim() || undefined
      );

      if (isDuplicate) {
        alert('Este libro ya existe en tu biblioteca.');
        return;
      }
    }

    if (this.editingBook) {
      // Actualizar libro existente
      const updatedBook: Book = {
        ...this.editingBook,
        title: this.title.trim(),
        author: this.author.trim(),
        isbn: this.isbn.trim() || undefined,
        coverImageUrl: this.coverImageUrl.trim() || undefined,
        pages: this.pages ? parseInt(this.pages) : undefined,
        description: this.description.trim() || undefined,
        collection: this.collection,
        status: this.status,
        format: this.format,
        pagesRead: this.status === 'read' ? (this.pages ? parseInt(this.pages) : undefined) : ((this.status === 'reading') ? this.pagesRead : undefined),
        borrowedBy: this.status === 'borrowed' ? this.borrowedBy.trim() : undefined,
        updatedAt: Date.now()
      };
      this.bookUpdated.emit(updatedBook);
    } else {
      // Agregar libro nuevo
      const newBook: Omit<Book, 'id' | 'createdAt' | 'updatedAt'> = {
        title: this.title.trim(),
        author: this.author.trim(),
        isbn: this.isbn.trim() || undefined,
        coverImageUrl: this.coverImageUrl.trim() || undefined,
        pages: this.pages ? parseInt(this.pages) : undefined,
        description: this.description.trim() || undefined,
        collection: this.collection,
        status: this.status,
        format: this.format,
        pagesRead: this.status === 'read' ? (this.pages ? parseInt(this.pages) : undefined) : ((this.status === 'reading') ? this.pagesRead : undefined),
        borrowedBy: this.status === 'borrowed' ? this.borrowedBy.trim() : undefined
      };
      this.bookAdded.emit(newBook);
    }
    this.resetForm();
  }

  private resetForm(): void {
    this.title = '';
    this.author = '';
    this.isbn = '';
    this.pages = '';
    this.description = '';
    this.coverImageUrl = '';
    this.collection = this.defaultCollection;
    this.status = 'to-read';
    this.format = 'physical';
    this.pagesRead = 0;
    this.borrowedBy = '';
    this.suggestions = [];
    this.showSuggestions = false;
    this.selectedBookIds.clear();
    this.newCollectionName = '';
  }
}

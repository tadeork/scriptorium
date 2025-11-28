import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book } from '../../models/book';
import { CombinedSearchService, CombinedSearchResult } from '../../services/combined-search.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.scss'
})
export class BookFormComponent implements OnInit, OnChanges {
  @Input() editingBook: Book | null = null;
  @Output() bookAdded = new EventEmitter<Omit<Book, 'id' | 'createdAt' | 'updatedAt'>>();
  @Output() bookUpdated = new EventEmitter<Book>();

  title = '';
  author = '';
  isbn = '';
  pages = '';
  description = '';
  coverImageUrl = '';
  status: 'read' | 'reading' | 'to-read' | 'not-interested' | 'borrowed' = 'to-read';
  readProgress = 0;

  suggestions: CombinedSearchResult[] = [];
  showSuggestions = false;
  showResultsModal = false;
  searchQuery$ = new Subject<string>();
  isSearching = false;
  searchError = false;
  noResultsMessage = '';

  constructor(private combinedSearchService: CombinedSearchService) {}

  ngOnInit(): void {
    if (this.editingBook) {
      this.loadBookData();
    }

    this.searchQuery$
      .pipe(debounceTime(300))
      .subscribe((query) => {
        if (query.trim()) {
          this.isSearching = true;
          this.searchError = false;
          this.noResultsMessage = '';

          this.combinedSearchService.searchBothLibraries(query).subscribe((results) => {
            this.isSearching = false;

            if (results.length === 0) {
              this.searchError = true;
              this.noResultsMessage = 'No se encontraron coincidencias en la búsqueda';
              this.suggestions = [];
              this.showSuggestions = false;
              this.showResultsModal = false;
            } else {
              // Priorizar resultados con imágenes
              const resultsWithImages = results.filter(r => r.coverImageUrl);
              const resultsWithoutImages = results.filter(r => !r.coverImageUrl);

              this.suggestions = [...resultsWithImages, ...resultsWithoutImages];
              this.searchError = false;
              this.noResultsMessage = '';
              this.showSuggestions = false;
              this.showResultsModal = true;
            }
          });
        } else {
          this.suggestions = [];
          this.showSuggestions = false;
          this.searchError = false;
          this.noResultsMessage = '';
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
  }

  private loadBookData(): void {
    if (!this.editingBook) return;
    this.title = this.editingBook.title;
    this.author = this.editingBook.author;
    this.isbn = this.editingBook.isbn || '';
    this.pages = this.editingBook.pages?.toString() || '';
    this.description = this.editingBook.description || '';
    this.coverImageUrl = this.editingBook.coverImageUrl || '';
    this.status = this.editingBook.status;
    this.readProgress = this.editingBook.readProgress || 0;
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
    this.showResultsModal = false;
  }

  closeResultsModal(): void {
    this.showResultsModal = false;
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.author.trim()) {
      alert('Por favor completa al menos el título y el autor');
      return;
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
        status: this.status,
        readProgress: (this.status === 'read' || this.status === 'reading') ? parseInt(this.readProgress.toString()) || 0 : undefined,
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
        status: this.status,
        readProgress: (this.status === 'read' || this.status === 'reading') ? parseInt(this.readProgress.toString()) || 0 : undefined
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
    this.status = 'to-read';
    this.readProgress = 0;
    this.suggestions = [];
    this.showSuggestions = false;
  }
}


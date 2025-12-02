import { Component, OnInit, signal, computed, Output, EventEmitter, Input } from '@angular/core';
import { BookService } from '../../services/book.service';
import { Book, BookStatus } from '../../models/book';
import { BookCardComponent } from '../book-card/book-card.component';
import { SearchFilterComponent } from '../search-filter/search-filter.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [BookCardComponent, SearchFilterComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent implements OnInit {
  searchQuery = signal('');
  selectedStatus = signal<BookStatus | 'all'>('all');
  sortBy = signal<'newest' | 'oldest' | 'title' | 'author'>('newest');
  editingBookId = signal<string | null>(null);
  collection = signal<'library' | 'wishlist'>('library');
  @Input('collection') set collectionInput(value: 'library' | 'wishlist') {
    this.collection.set(value);
  }
  @Output() editBook = new EventEmitter<Book>();

  filteredBooks = computed(() => {
    let books = this.bookService.books$();
    const query = this.searchQuery();
    const status = this.selectedStatus();
    const sort = this.sortBy();
    const currentCollection = this.collection();

    // Filter by collection
    books = books.filter(b => (b.collection || 'library') === currentCollection);

    // Apply search filter
    if (query.trim()) {
      books = this.bookService.searchBooks(query);
      // Re-apply collection filter after search (since searchBooks might return all matches)
      books = books.filter(b => (b.collection || 'library') === currentCollection);
    }

    // Apply status filter
    if (status !== 'all') {
      books = books.filter((b) => b.status === status);
    }

    // Apply sorting
    if (sort === 'newest') {
      books = [...books].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sort === 'oldest') {
      books = [...books].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } else if (sort === 'title') {
      books = [...books].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'author') {
      books = [...books].sort((a, b) => a.author.localeCompare(b.author));
    }

    return books;
  });

  constructor(private bookService: BookService) { }

  ngOnInit(): void { }

  onSearchQueryChange(query: string): void {
    this.searchQuery.set(query);
  }

  onStatusFilterChange(status: BookStatus | 'all'): void {
    this.selectedStatus.set(status);
  }

  onSortByChange(sort: 'newest' | 'oldest' | 'title' | 'author'): void {
    this.sortBy.set(sort);
  }

  onDeleteBook(id: string): void {
    this.bookService.deleteBook(id);
  }

  onUpdateStatus(payload: { id: string; status: string }): void {
    this.bookService.updateBook(payload.id, { status: payload.status as BookStatus });
  }

  onUpdateProgress(payload: { id: string; progress: number }): void {
    this.bookService.updateProgress(payload.id, payload.progress);
  }

  onEditBook(book: Book): void {
    this.editingBookId.set(book.id);
    this.editBook.emit(book);
  }

  onBookUpdated(book: Book): void {
    this.bookService.updateBook(book.id, book);
    this.editingBookId.set(null);
  }

  get emptyMessage(): string {
    if (this.searchQuery().trim()) {
      return 'No se encontraron libros que coincidan con tu búsqueda.';
    }
    if (this.selectedStatus() !== 'all') {
      return 'No tienes libros con este estado.';
    }
    return 'No tienes libros registrados. ¡Agrega uno!';
  }
}

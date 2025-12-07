import { Component, OnInit, signal, computed, Output, EventEmitter, Input, inject } from '@angular/core';
import { BookService } from '../../services/book.service';
import { CollectionService } from '../../services/collection.service';
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
  selectedCollectionId = signal('');
  sortBy = signal<'newest' | 'oldest' | 'title' | 'author'>('newest');
  editingBookId = signal<string | null>(null);
  collection = signal<'library' | 'wishlist'>('library');
  @Input('collection') set collectionInput(value: 'library' | 'wishlist') {
    this.collection.set(value);
  }
  @Output() editBook = new EventEmitter<Book>();
  @Output() addBookFromSearch = new EventEmitter<string>();

  private bookService = inject(BookService);
  private collectionService = inject(CollectionService);

  collections = this.collectionService.collections$;

  filteredBooks = computed(() => {
    let books = this.bookService.books$();
    const query = this.searchQuery();
    const status = this.selectedStatus();
    const sort = this.sortBy();
    const currentCollection = this.collection();
    const selectedColl = this.selectedCollectionId();

    // Filter by main collection (library vs wishlist)
    books = books.filter(b => (b.collection || 'library') === currentCollection);

    // Filter by custom collection
    if (selectedColl && currentCollection === 'library') {
      books = books.filter(b => b.customCollections?.includes(selectedColl));
    }

    // Apply search filter
    if (query.trim()) {
      books = this.bookService.searchBooks(query);
      // Re-apply collection filters after search
      books = books.filter(b => (b.collection || 'library') === currentCollection);
      if (selectedColl && currentCollection === 'library') {
        books = books.filter(b => b.customCollections?.includes(selectedColl));
      }
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

  statusCounts = computed(() => {
    const books = this.bookService.books$();
    const currentCollection = this.collection();
    const selectedColl = this.selectedCollectionId();

    // Base filter: current main collection
    let collectionBooks = books.filter(b => (b.collection || 'library') === currentCollection);

    // Apply custom collection filter if selected
    if (selectedColl && currentCollection === 'library') {
      collectionBooks = collectionBooks.filter(b => b.customCollections?.includes(selectedColl));
    }

    const counts: Record<string, number> = {
      'all': collectionBooks.length,
      'read': 0,
      'reading': 0,
      'to-read': 0,
      'borrowed': 0,
      'not-interested': 0
    };

    collectionBooks.forEach(book => {
      if (counts[book.status] !== undefined) {
        counts[book.status]++;
      }
    });

    return counts;
  });

  constructor() { }

  ngOnInit(): void { }

  onSearchQueryChange(query: string): void {
    this.searchQuery.set(query);
  }

  onStatusFilterChange(status: BookStatus | 'all'): void {
    this.selectedStatus.set(status);
  }

  onCollectionFilterChange(collectionId: string): void {
    this.selectedCollectionId.set(collectionId);
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

  onMoveToLibrary(book: Book): void {
    this.bookService.updateBook(book.id, {
      collection: 'library',
      status: 'to-read'
    });
  }

  onMoveToWishlist(book: Book): void {
    this.bookService.updateBook(book.id, {
      collection: 'wishlist'
    });
  }

  onEditBook(book: Book): void {
    this.editingBookId.set(book.id);
    this.editBook.emit(book);
  }

  onBookUpdated(book: Book): void {
    this.bookService.updateBook(book.id, book);
    this.editingBookId.set(null);
  }

  onAddFromSearch(): void {
    this.addBookFromSearch.emit(this.searchQuery());
  }

  get emptyMessage(): string {
    if (this.searchQuery().trim()) {
      return 'No se encontraron libros que coincidan con tu búsqueda.';
    }
    if (this.selectedCollectionId()) {
      return 'No hay libros en esta colección con el filtro seleccionado.';
    }
    if (this.selectedStatus() !== 'all') {
      return 'No tienes libros con este estado.';
    }
    return 'No tienes libros registrados. ¡Agrega uno!';
  }
}

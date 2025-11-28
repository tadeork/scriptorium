import { Component, OnInit, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/book.service';
import { Book, BookStatus } from '../../models/book';
import { BookCardComponent } from '../book-card/book-card.component';
import { SearchFilterComponent } from '../search-filter/search-filter.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, BookCardComponent, SearchFilterComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent implements OnInit {
  searchQuery = signal('');
  selectedStatus = signal<BookStatus | 'all'>('all');
  editingBookId = signal<string | null>(null);
  @Output() editBook = new EventEmitter<Book>();

  filteredBooks = computed(() => {
    let books = this.bookService.books$();
    const query = this.searchQuery();
    const status = this.selectedStatus();

    // Apply search filter
    if (query.trim()) {
      books = this.bookService.searchBooks(query);
    }

    // Apply status filter
    if (status !== 'all') {
      books = books.filter((b) => b.status === status);
    }

    return books;
  });

  constructor(private bookService: BookService) {}

  ngOnInit(): void {}

  onSearchQueryChange(query: string): void {
    this.searchQuery.set(query);
  }

  onStatusFilterChange(status: BookStatus | 'all'): void {
    this.selectedStatus.set(status);
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

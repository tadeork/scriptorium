import { Component, signal } from '@angular/core';
import { BookFormComponent } from './components/book-form/book-form.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookService } from './services/book.service';
import { Book } from './models/book';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BookFormComponent, BookListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Scriptorium');
  protected readonly currentView = signal<'library' | 'wishlist'>('library');
  showFormModal = false;
  showEditModal = false;
  editingBook: Book | null = null;

  constructor(private bookService: BookService) { }

  onBookAdded(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): void {
    // Ensure the new book has the correct collection based on current view, 
    // unless the user explicitly changed it in the form (which BookForm handles)
    // Actually BookForm handles the collection selection, so we just pass it through.
    this.bookService.addBook(book);
  }

  setView(view: 'library' | 'wishlist'): void {
    this.currentView.set(view);
  }

  toggleFormModal(): void {
    this.showFormModal = !this.showFormModal;
  }

  openEditModal(book: Book): void {
    this.editingBook = book;
    this.showEditModal = true;
  }

  toggleEditModal(): void {
    this.showEditModal = !this.showEditModal;
    if (!this.showEditModal) {
      this.editingBook = null;
    }
  }

  onBookUpdated(book: Book): void {
    this.bookService.updateBook(book.id, book);
  }
}

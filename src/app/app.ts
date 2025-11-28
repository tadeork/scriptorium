import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookFormComponent } from './components/book-form/book-form.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookService } from './services/book.service';
import { Book } from './models/book';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BookFormComponent, BookListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Bookyman');
  showFormModal = false;
  showEditModal = false;
  editingBook: Book | null = null;

  constructor(private bookService: BookService) {}

  onBookAdded(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.bookService.addBook(book);
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

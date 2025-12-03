import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { LibraryAdminComponent } from './components/library-admin/library-admin.component';
import { Book } from './models/book';
import { BookService } from './services/book.service';

import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { UpdateNotificationComponent } from './components/update-notification/update-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BookListComponent, BookFormComponent, LibraryAdminComponent, UpdateNotificationComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('Scriptorium');
  protected readonly currentView = signal<'library' | 'wishlist'>('library');
  showFormModal = false;
  showEditModal = false;
  showAdminModal = false;
  editingBook: Book | null = null;

  showUpdateNotification = false;

  constructor(
    private bookService: BookService,
    private swUpdate: SwUpdate
  ) {
    this.checkForUpdates();
  }

  checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        this.showUpdateNotification = true;
      });
    }
  }

  reloadPage(): void {
    window.location.reload();
  }

  onBookAdded(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.bookService.addBook(book);
  }

  setView(view: 'library' | 'wishlist'): void {
    this.currentView.set(view);
  }

  toggleFormModal(): void {
    this.showFormModal = !this.showFormModal;
  }

  toggleEditModal(): void {
    this.showEditModal = !this.showEditModal;
    if (!this.showEditModal) {
      this.editingBook = null;
    }
  }

  toggleAdminModal(): void {
    this.showAdminModal = !this.showAdminModal;
  }

  openEditModal(book: Book): void {
    this.editingBook = book;
    this.showEditModal = true;
  }

  onBookUpdated(book: Book): void {
    this.bookService.updateBook(book.id, book);
  }
}

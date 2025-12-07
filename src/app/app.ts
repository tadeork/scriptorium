import { Component, computed, effect, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { LibraryAdminComponent } from './components/library-admin/library-admin.component';
import { Book } from './models/book';
import { BookService } from './services/book.service';

import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { UpdateNotificationComponent } from './components/update-notification/update-notification.component';

import { WelcomeModalComponent } from './components/welcome-modal/welcome-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BookListComponent, BookFormComponent, LibraryAdminComponent, UpdateNotificationComponent, WelcomeModalComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected readonly title = signal('Scriptorium');
  protected readonly currentView = signal<'library' | 'wishlist'>('library');
  showFormModal = false;
  showEditModal = false;
  showAdminModal = false;
  editingBook: Book | null = null;

  showUpdateNotification = false;
  showAddBookTooltip = false;
  initialFormTitle = '';

  @ViewChild(WelcomeModalComponent) welcomeModal!: WelcomeModalComponent;

  constructor(
    private bookService: BookService,
    private swUpdate: SwUpdate
  ) {
    this.checkForUpdates();
  }

  ngOnInit(): void {
    this.updateTitle();
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

  updateTitle(): void {
    const userName = localStorage.getItem('userName');
    if (userName) {
      this.title.set(`Scriptorium de ${userName}`);
    } else {
      this.title.set('Scriptorium');
    }
  }

  onShowWelcome(): void {
    this.showAdminModal = false;
    this.welcomeModal.open();
  }

  onWelcomeClosed(): void {
    this.updateTitle();
    const hasBooks = this.bookService.books$().length > 0;
    this.showAddBookTooltip = true;

    if (hasBooks) {
      setTimeout(() => {
        this.showAddBookTooltip = false;
      }, 5000);
    }
  }

  reloadPage(): void {
    window.location.reload();
  }

  onBookAdded(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.bookService.addBook(book);
    this.showAddBookTooltip = false;
  }

  onAddBookFromSearch(query: string): void {
    this.initialFormTitle = query;
    this.showFormModal = true;
    this.showAddBookTooltip = false;
  }

  setView(view: 'library' | 'wishlist'): void {
    this.currentView.set(view);
  }

  toggleFormModal(): void {
    if (!this.showFormModal) {
      // Opening the modal
      this.showAddBookTooltip = false;
    } else {
      // Closing the modal
      this.initialFormTitle = '';
    }
    this.showFormModal = !this.showFormModal;
    this.updateScrollLock();
  }

  toggleEditModal(): void {
    this.showEditModal = !this.showEditModal;
    if (!this.showEditModal) {
      this.editingBook = null;
    }
    this.updateScrollLock();
  }

  toggleAdminModal(): void {
    this.showAdminModal = !this.showAdminModal;
    this.updateScrollLock();
  }

  openEditModal(book: Book): void {
    this.editingBook = book;
    this.showEditModal = true;
    this.updateScrollLock();
  }

  onBookUpdated(book: Book): void {
    this.bookService.updateBook(book.id, book);
  }

  private updateScrollLock(): void {
    const isAnyModalOpen = this.showFormModal || this.showEditModal || this.showAdminModal;
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : '';
  }
}

import { Component, computed, effect, OnInit, signal, ViewChild, inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookListComponent } from './components/book-list/book-list.component';
import { CollectionsListComponent } from './components/collections-list/collections-list.component';
import { CollectionFormComponent } from './components/collection-form/collection-form.component';
import { CollectionDetailsComponent } from './components/collection-details/collection-details.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { LibraryAdminComponent } from './components/library-admin/library-admin.component';
import { ModalOverlayComponent } from './components/modal-overlay/modal-overlay.component';
import { Book } from './models/book';
import { BookService } from './services/book.service';

import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { UpdateNotificationComponent } from './components/update-notification/update-notification.component';

import { WelcomeModalComponent } from './components/welcome-modal/welcome-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    BookListComponent,
    CollectionsListComponent,
    BookFormComponent,
    CollectionFormComponent,
    CollectionDetailsComponent,
    LibraryAdminComponent,
    UpdateNotificationComponent,
    WelcomeModalComponent,
    ModalOverlayComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  protected readonly title = signal('Scriptorium');
  protected readonly currentView = signal<'library' | 'wishlist' | 'collections'>('library');
  showAddBookModal = false;
  showCollectionModal = false;
  showEditModal = false;
  showAdminModal = false;
  editingBook: Book | null = null;
  selectedCollection: string | null = null;

  showUpdateNotification = false;
  showAddBookTooltip = false;
  initialFormTitle = '';

  showWelcomeModal = false;

  @ViewChild(WelcomeModalComponent) welcomeModal!: WelcomeModalComponent;

  constructor(
    private bookService: BookService,
    private swUpdate: SwUpdate,
    private renderer: Renderer2
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

    setTimeout(() => {
      this.showAddBookTooltip = false;
    }, 8000);
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
    this.showAddBookModal = true;
    this.showAddBookTooltip = false;
    this.updateScrollLock();
  }

  setView(view: 'library' | 'wishlist' | 'collections'): void {
    this.currentView.set(view);
  }

  updateScrollLock(): void {
    const shouldLock = this.showAddBookModal || this.showEditModal || this.showAdminModal || this.showCollectionModal || !!this.selectedCollection || this.showWelcomeModal;
    if (shouldLock) {
      this.renderer.addClass(document.body, 'no-scroll');
    } else {
      this.renderer.removeClass(document.body, 'no-scroll');
    }
  }

  toggleAddBookModal(): void {
    if (!this.showAddBookModal) {
      // Opening the modal
      this.showAddBookTooltip = false;
    } else {
      // Closing the modal
      this.initialFormTitle = '';
    }
    this.showAddBookModal = !this.showAddBookModal;
    this.showCollectionModal = false;
    this.updateScrollLock();
  }

  toggleEditModal(): void {
    this.showEditModal = !this.showEditModal;
    if (!this.showEditModal) {
      this.editingBook = null;
    }
    this.updateScrollLock();
  }

  toggleLibraryAdmin(): void {
    this.showAdminModal = !this.showAdminModal;
    this.updateScrollLock();
  }

  openEditModal(book: Book): void {
    this.editingBook = book;
    this.showEditModal = true;
    this.updateScrollLock();
  }

  toggleWelcomeModal(): void {
    this.showWelcomeModal = !this.showWelcomeModal;
    this.updateScrollLock();
  }

  toggleCollectionModal(): void {
    this.showCollectionModal = !this.showCollectionModal;
    this.updateScrollLock();
  }

  onOpenAddCollection(): void {
    this.showCollectionModal = true;
    this.updateScrollLock();
  }

  onSelectCollection(collectionName: string): void {
    this.selectedCollection = collectionName;
    this.updateScrollLock();
  }

  onCloseCollectionDetails(): void {
    this.selectedCollection = null;
    this.updateScrollLock();
  }

  onBookUpdated(book: Book): void {
    this.bookService.updateBook(book.id, book);
  }

}

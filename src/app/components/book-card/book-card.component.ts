import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Book } from '../../models/book';
import { StatusSelectorComponent } from '../status-selector/status-selector.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { ModalOverlayComponent } from '../modal-overlay/modal-overlay.component';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [StatusSelectorComponent, ProgressBarComponent, ModalOverlayComponent, DatePipe],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss'
})
export class BookCardComponent {
  @Input() book!: Book;
  @Output() deleteBook = new EventEmitter<string>();
  @Output() updateStatus = new EventEmitter<{ id: string; status: string }>();
  @Output() updateProgress = new EventEmitter<{ id: string; progress: number }>();
  @Output() editBook = new EventEmitter<Book>();

  showDetails = false;

  statusLabels = {
    read: 'Leído',
    reading: 'Leyendo',
    'to-read': 'Por leer',
    'not-interested': 'No voy a leer',
    borrowed: 'Prestado'
  };

  onDeleteClick(): void {
    if (confirm('¿Estás seguro de que deseas eliminar este libro?')) {
      this.deleteBook.emit(this.book.id);
    }
  }

  onEditClick(): void {
    this.editBook.emit(this.book);
  }

  onStatusChange(target: EventTarget | null): void {
    if (target instanceof HTMLSelectElement) {
      this.updateStatus.emit({ id: this.book.id, status: target.value });
    }
  }

  incrementProgress(): void {
    if (!this.book.pages) return;

    // Si está en "to-read", cambiar a "reading"
    if (this.book.status === 'to-read') {
      this.updateStatus.emit({ id: this.book.id, status: 'reading' });
    }

    const currentPages = this.book.pagesRead || 0;
    const newPages = Math.min(this.book.pages, currentPages + 1);
    this.updateProgress.emit({ id: this.book.id, progress: newPages });
  }

  decrementProgress(): void {
    if (!this.book.pages) return;
    const currentPages = this.book.pagesRead || 0;
    const newPages = Math.max(0, currentPages - 1);
    this.updateProgress.emit({ id: this.book.id, progress: newPages });
  }

  calculatePagesRead(): number {
    return this.book.pagesRead || 0;
  }

  getProgressPercentage(): number {
    if (!this.book.pages) return 0;
    return Math.round((this.book.pagesRead || 0) / this.book.pages * 100);
  }

  isBookRead(): boolean {
    return this.book.status === 'read';
  }

  get statusClass(): string {
    return `status-${this.book.status}`;
  }

  onCardClick(): void {
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
  }
}

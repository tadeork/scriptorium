import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss'
})
export class BookCardComponent {
  @Input() book!: Book;
  @Output() deleteBook = new EventEmitter<string>();
  @Output() updateStatus = new EventEmitter<{ id: string; status: string }>();
  @Output() updateProgress = new EventEmitter<{ id: string; progress: number }>();
  @Output() editBook = new EventEmitter<Book>();

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
    const pageIncrement = (100 / this.book.pages);
    const newProgress = Math.min(100, (this.book.readProgress || 0) + pageIncrement);
    this.updateProgress.emit({ id: this.book.id, progress: Math.round(newProgress) });
  }

  decrementProgress(): void {
    if (!this.book.pages) return;
    const pageIncrement = (100 / this.book.pages);
    const newProgress = Math.max(0, (this.book.readProgress || 0) - pageIncrement);
    this.updateProgress.emit({ id: this.book.id, progress: Math.round(newProgress) });
  }

  calculatePagesRead(): number {
    if (!this.book.pages) return 0;
    return Math.round((this.book.pages * (this.book.readProgress || 0)) / 100);
  }

  get statusClass(): string {
    return `status-${this.book.status}`;
  }
}

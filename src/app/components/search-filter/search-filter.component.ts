import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book, BookStatus } from '../../models/book';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss'
})
export class SearchFilterComponent {
  @Input() searchQuery = '';
  @Input() selectedStatus: BookStatus | 'all' = 'all';
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() statusFilterChange = new EventEmitter<BookStatus | 'all'>();

  readonly statuses: Array<{ value: BookStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'read', label: 'Leído' },
    { value: 'reading', label: 'Leyendo' },
    { value: 'to-read', label: 'Por leer' },
    { value: 'borrowed', label: 'Prestado' },
    { value: 'not-interested', label: 'No voy a leer' }
  ];

  onSearchChange(query: string): void {
    this.searchQueryChange.emit(query);
  }

  onStatusChange(status: BookStatus | 'all'): void {
    this.statusFilterChange.emit(status);
  }
}

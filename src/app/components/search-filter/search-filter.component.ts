import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book, BookStatus } from '../../models/book';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss'
})
export class SearchFilterComponent {
  @Input() searchQuery = '';
  @Input() selectedStatus: BookStatus | 'all' = 'all';
  @Input() sortBy: 'newest' | 'oldest' | 'title' | 'author' = 'newest';
  @Input() showFilters = true;
  @Input() statusCounts: Record<string, number> = {};
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() statusFilterChange = new EventEmitter<BookStatus | 'all'>();
  @Output() sortByChange = new EventEmitter<'newest' | 'oldest' | 'title' | 'author'>();

  filtersVisible = false;

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  readonly statuses: Array<{ value: BookStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'read', label: 'Leído' },
    { value: 'reading', label: 'Leyendo' },
    { value: 'to-read', label: 'Por leer' },
    { value: 'borrowed', label: 'Prestado' },
    { value: 'not-interested', label: 'No voy a leer' }
  ];

  readonly sortOptions: Array<{ value: 'newest' | 'oldest' | 'title' | 'author'; label: string }> = [
    { value: 'newest', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'title', label: 'Título (A-Z)' },
    { value: 'author', label: 'Autor (A-Z)' }
  ];

  onSearchChange(query: string): void {
    this.searchQueryChange.emit(query);
  }

  onStatusChange(status: BookStatus | 'all'): void {
    this.statusFilterChange.emit(status);
  }

  onSortChange(sort: 'newest' | 'oldest' | 'title' | 'author'): void {
    this.sortByChange.emit(sort);
  }
}

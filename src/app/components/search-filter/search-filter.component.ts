import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
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

  // Dropdown states
  isStatusDropdownOpen = false;
  isSortDropdownOpen = false;

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
    }
  }

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  toggleStatusDropdown(event: Event): void {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  toggleSortDropdown(event: Event): void {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.isSortDropdownOpen = !this.isSortDropdownOpen;
  }

  closeAllDropdowns(): void {
    this.isStatusDropdownOpen = false;
    this.isSortDropdownOpen = false;
  }

  selectStatus(status: BookStatus | 'all'): void {
    this.onStatusChange(status);
    this.closeAllDropdowns();
  }

  selectSort(sort: 'newest' | 'oldest' | 'title' | 'author'): void {
    this.onSortChange(sort);
    this.closeAllDropdowns();
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



  getStatusLabel(value: string): string {
    return this.statuses.find(s => s.value === value)?.label || 'Todos';
  }

  getSortLabel(value: string): string {
    return this.sortOptions.find(s => s.value === value)?.label || 'Más recientes';
  }
}

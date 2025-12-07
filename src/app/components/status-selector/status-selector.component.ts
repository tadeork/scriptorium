import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type BookStatus = 'read' | 'reading' | 'to-read' | 'not-interested' | 'borrowed';

@Component({
  selector: 'app-status-selector',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './status-selector.component.html',
  styleUrl: './status-selector.component.scss'
})
export class StatusSelectorComponent {
  @Input() status: BookStatus = 'to-read';
  @Input() id: string = 'status-selector';
  @Input() label = 'Estado *';
  @Output() statusChange = new EventEmitter<BookStatus>();

  isOpen = false;

  statusOptions = [
    { value: 'to-read', label: 'Por leer' },
    { value: 'reading', label: 'Leyendo' },
    { value: 'read', label: 'Leído' },
    { value: 'borrowed', label: 'Prestado' },
    { value: 'not-interested', label: 'No voy a leer' }
  ];

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  selectStatus(value: string): void {
    this.statusChange.emit(value as BookStatus);
    this.closeDropdown();
  }

  getStatusLabel(value: string): string {
    return this.statusOptions.find(opt => opt.value === value)?.label || value;
  }
}

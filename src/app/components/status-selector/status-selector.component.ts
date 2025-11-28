import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type BookStatus = 'read' | 'reading' | 'to-read' | 'not-interested' | 'borrowed';

@Component({
  selector: 'app-status-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './status-selector.component.html',
  styleUrl: './status-selector.component.scss'
})
export class StatusSelectorComponent {
  @Input() status: BookStatus = 'to-read';
  @Input() id: string = 'status-selector';
  @Input() label = 'Estado *';
  @Output() statusChange = new EventEmitter<BookStatus>();

  statusOptions = [
    { value: 'to-read', label: 'Por leer' },
    { value: 'reading', label: 'Leyendo' },
    { value: 'read', label: 'Leído' },
    { value: 'borrowed', label: 'Prestado' },
    { value: 'not-interested', label: 'No voy a leer' }
  ];

  onStatusChange(value: string): void {
    this.statusChange.emit(value as BookStatus);
  }
}

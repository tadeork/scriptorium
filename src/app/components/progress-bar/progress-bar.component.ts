import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  @Input() progress = 0; // porcentaje 0-100
  @Input() pages = 0;
  @Input() pagesRead = 0; // páginas leídas (para uso cuando está disponible)
  @Input() variant: 'display' | 'editable' = 'display';
  @Input() disabled = false; // deshabilitar cuando el libro está leído
  @Output() increment = new EventEmitter<void>();
  @Output() decrement = new EventEmitter<void>();

  get pagesReadDisplay(): number {
    if (this.pagesRead > 0) {
      return this.pagesRead;
    }
    // Fallback: calcular desde porcentaje
    if (!this.pages) return 0;
    return Math.round((this.pages * this.progress) / 100);
  }

  get displayProgress(): number {
    // Mostrar 100% cuando está deshabilitado (libro leído)
    return this.disabled ? 100 : this.progress;
  }

  onIncrement(): void {
    if (!this.disabled) {
      this.increment.emit();
    }
  }

  onDecrement(): void {
    if (!this.disabled) {
      this.decrement.emit();
    }
  }
}

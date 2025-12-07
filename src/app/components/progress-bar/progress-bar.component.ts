import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [FormsModule],
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
  @Output() pagesReadChange = new EventEmitter<number>();

  private intervalId: any;
  private timeoutId: any;

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

  startRepeating(action: 'increment' | 'decrement', event?: Event): void {
    if (this.disabled) return;

    // Prevent default to avoid potential conflicts (e.g. text selection)
    if (event) {
      event.preventDefault();
    }

    const performAction = () => {
      if (action === 'increment') {
        this.increment.emit();
      } else {
        this.decrement.emit();
      }
    };

    // Execute immediately
    performAction();

    // Clear any existing timers
    this.stopRepeating();

    // Start delay before repeating
    this.timeoutId = setTimeout(() => {
      // Start repeating interval
      this.intervalId = setInterval(performAction, 200);
    }, 400);
  }

  stopRepeating(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Keep for keyboard accessibility
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

  @ViewChild('pagesInput') pagesInput!: ElementRef<HTMLInputElement>;

  onPagesInput(value: number): void {
    if (this.disabled) return;

    // Clamp value between 0 and total pages
    let validValue = Math.max(0, value);
    if (this.pages > 0) {
      validValue = Math.min(validValue, this.pages);
    }

    // Force view update if the value was clamped (view value !== model value)
    if (validValue !== value && this.pagesInput) {
      this.pagesInput.nativeElement.value = validValue.toString();
    }

    this.pagesReadChange.emit(validValue);
  }
}

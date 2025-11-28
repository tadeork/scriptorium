import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss'
})
export class ProgressBarComponent {
  @Input() progress = 0;
  @Input() pages = 0;
  @Input() variant: 'display' | 'editable' = 'display';
  @Output() increment = new EventEmitter<void>();
  @Output() decrement = new EventEmitter<void>();

  get pagesRead(): number {
    if (!this.pages) return 0;
    return Math.round((this.pages * this.progress) / 100);
  }

  onIncrement(): void {
    this.increment.emit();
  }

  onDecrement(): void {
    this.decrement.emit();
  }
}

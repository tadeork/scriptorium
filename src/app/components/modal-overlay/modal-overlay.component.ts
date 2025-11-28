import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-overlay.component.html',
  styleUrl: './modal-overlay.component.scss'
})
export class ModalOverlayComponent {
  @Input() isOpen = false;
  @Input() title: string | null = null;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() close = new EventEmitter<void>();

  onOverlayClick(): void {
    this.close.emit();
  }

  onContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onCloseClick(): void {
    this.close.emit();
  }
}

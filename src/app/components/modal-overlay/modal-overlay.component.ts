import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-overlay',
  standalone: true,
  imports: [],
  templateUrl: './modal-overlay.component.html',
  styleUrl: './modal-overlay.component.scss'
})
export class ModalOverlayComponent {
  @Input() isOpen = false;
  @Input() title: string | null = null;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() zIndex = 1000;
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

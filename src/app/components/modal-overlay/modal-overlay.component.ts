import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges, HostListener } from '@angular/core';

@Component({
  selector: 'app-modal-overlay',
  standalone: true,
  imports: [],
  templateUrl: './modal-overlay.component.html',
  styleUrl: './modal-overlay.component.scss'
})
export class ModalOverlayComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() title: string | null = null;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() zIndex = 1000;
  @Output() close = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close.emit();
    }
  }

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

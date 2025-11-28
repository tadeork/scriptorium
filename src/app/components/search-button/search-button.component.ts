import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-button',
  standalone: true,
  imports: [],
  templateUrl: './search-button.component.html',
  styleUrl: './search-button.component.scss'
})
export class SearchButtonComponent {
  @Input() isLoading = false;
  @Input() isDisabled = false;
  @Input() text = 'Buscar';
  @Input() icon = '🔍';
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.isLoading && !this.isDisabled) {
      this.clicked.emit();
    }
  }
}

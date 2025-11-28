import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CombinedSearchResult } from '../../services/combined-search.service';

@Component({
  selector: 'app-book-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-item.component.html',
  styleUrl: './book-item.component.scss'
})
export class BookItemComponent {
  @Input() book!: CombinedSearchResult;
  @Input() variant: 'compact' | 'full' = 'compact';
  @Output() selected = new EventEmitter<CombinedSearchResult>();

  onClick(): void {
    this.selected.emit(this.book);
  }
}

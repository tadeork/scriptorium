import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookListComponent } from '../book-list/book-list.component';

@Component({
  selector: 'app-collection-details',
  standalone: true,
  imports: [CommonModule, BookListComponent],
  template: `
    <div class="modal-header">
      <h2 class="modal-title">{{ collectionName }}</h2>
      <button class="close-btn" (click)="close.emit()">×</button>
    </div>
    <div class="modal-body">
      <app-book-list [collection]="'library'" [forcedCollection]="collectionName"></app-book-list>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      max-height: 80vh;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 2px solid #212121;
      background-color: #fff;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 900;
      margin: 0;
      text-transform: uppercase;
      color: #212121;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 2rem;
      font-weight: 700;
      color: #212121;
      cursor: pointer;
      line-height: 1;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin-left: 1rem;
      
      &:hover {
        color: #d32f2f;
      }
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background-color: #f5f5f5;
    }
  `]
})
export class CollectionDetailsComponent {
  @Input() collectionName = '';
  @Output() close = new EventEmitter<void>();
}

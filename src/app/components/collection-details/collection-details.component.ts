import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookListComponent } from '../book-list/book-list.component';

@Component({
  selector: 'app-collection-details',
  standalone: true,
  imports: [CommonModule, BookListComponent],
  template: `
    <div class="modal-header">
      <h2 class="modal-title">{{ collectionName }}</h2>
      <div class="header-actions">
        <button class="edit-btn" (click)="edit.emit()" title="Editar categoría">✎</button>
        <button class="close-btn" (click)="close.emit()">×</button>
      </div>
    </div>
    <div class="modal-body">
      <app-book-list [collection]="'library'" [forcedCollection]="collectionName"></app-book-list>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #f5f5f5;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 2px solid #212121;
      background-color: #fff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    .modal-title {
      font-size: 2rem;
      font-weight: 900;
      margin: 0;
      text-transform: uppercase;
      color: #212121;
      letter-spacing: 0.05em;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .edit-btn {
      background: #212121;
      border: 2px solid #000;
      color: white;
      font-size: 1.25rem;
      font-weight: 700;
      cursor: pointer;
      width: 40px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
      transition: all 0.2s ease;
      
      &:hover {
        background-color: #424242;
        transform: translate(-1px, -1px);
        box-shadow: 3px 3px 0 rgba(0,0,0,0.3);
      }
      
      &:active {
        transform: translate(0, 0);
        box-shadow: 1px 1px 0 rgba(0,0,0,0.2);
      }
    }

    .close-btn {
      background: #d32f2f;
      border: 2px solid #b71c1c;
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
      cursor: pointer;
      line-height: 1;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin-left: 0;
      border-radius: 50%;
      box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
      transition: all 0.2s ease;
      
      &:hover {
        background-color: #c62828;
        transform: scale(1.1);
      }
      
      &:active {
        transform: scale(0.95);
      }
    }
    
    /* Mobile responsive styles */
    @media (max-width: 768px) {
      .modal-header {
        padding: 1rem;
      }

      .modal-title {
        font-size: 1.5rem;
      }
      
      .edit-btn, .close-btn {
        width: 36px;
        height: 36px;
        font-size: 1.1rem;
      }
      
      .header-actions {
        gap: 0.5rem;
      }

      .modal-body {
        padding: 1rem;
      }
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      background-color: #f5f5f5;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
  `]
})
export class CollectionDetailsComponent {
  @Input() collectionName = '';
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }
}

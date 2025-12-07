import { Component, computed, signal, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../services/collection.service';
import { BookService } from '../../services/book.service';

@Component({
    selector: 'app-collections-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="collections-grid">
      @for (collection of collectionsWithCounts(); track collection.name) {
      <div class="collection-card">
        <div class="collection-info">
          <h3 class="collection-title">{{ collection.name }}</h3>
          <span class="collection-count">{{ collection.count }} libros</span>
        </div>
      </div>
      }
    </div>

    @if (collectionsWithCounts().length === 0) {
    <div class="empty-state">
      <div class="empty-icon">📁</div>
      <p class="empty-message">No tienes categorías creadas.</p>
      <button class="create-btn" (click)="onCreateFirst()">Crea tu primera categoría</button>
    </div>
    }
  `,
    styles: [`
    .collections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .collection-card {
      background-color: #fff;
      border: 2px solid #212121;
      padding: 1.5rem;
      box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 120px;

      &:hover {
        transform: translate(-2px, -2px);
        box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.2);
      }
    }

    .collection-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      color: #212121;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .collection-count {
      font-size: 0.9rem;
      color: #757575;
      font-weight: 600;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      border: 2px dashed #e0e0e0;
      border-radius: 1px;
      background-color: #f9f9f9;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-message {
      font-size: 1.2rem;
      color: #757575;
      margin-bottom: 1.5rem;
      font-weight: 500;
    }

    .create-btn {
      background-color: #212121;
      color: #fff;
      border: none;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 4px 4px 0 rgba(0,0,0,0.2);
      transition: all 0.2s;

      &:hover {
        transform: translate(-2px, -2px);
        box-shadow: 6px 6px 0 rgba(0,0,0,0.3);
      }

      &:active {
        transform: translate(0, 0);
        box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
      }
    }
  `]
})
export class CollectionsListComponent {
    @Output() createCollection = new EventEmitter<void>();

    private collectionService = inject(CollectionService);
    private bookService = inject(BookService);

    collectionsWithCounts = computed(() => {
        const collections = this.collectionService.collections$();
        const books = this.bookService.books$();

        return collections.map(name => {
            const count = books.filter(b => b.customCollections?.includes(name)).length;
            return { name, count };
        });
    });

    onCreateFirst(): void {
        this.createCollection.emit();
    }
}

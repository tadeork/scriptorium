import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../../services/collection.service';

@Component({
    selector: 'app-collection-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <h2 class="form-title">Nueva Categoría</h2>
    <div class="form-group">
      <label class="form-label">Nombre *</label>
      <input type="text" [(ngModel)]="collectionName" class="form-input" placeholder="Ej. Novelas, Terror, Favoritos..." (keyup.enter)="create()">
      @if (errorMessage()) {
        <div class="error-message">{{ errorMessage() }}</div>
      }
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" (click)="create()" [disabled]="!collectionName.trim()">CREAR</button>
    </div>
  `,
    styles: [`
    .form-title {
      font-size: 1.5rem;
      font-weight: 900;
      margin: 0 0 1.5rem 0;
      text-transform: uppercase;
      color: #212121;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      font-size: 0.9rem;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 1px solid #212121;
      background-color: #fff;
      box-sizing: border-box;
      transition: all 0.2s;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #d32f2f;
        box-shadow: 4px 4px 0 rgba(211, 47, 47, 0.2);
      }
    }

    .error-message {
      color: #d32f2f;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      font-weight: 600;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      font-weight: 700;
      text-transform: uppercase;
      cursor: pointer;
      border: 1px solid #212121;
      font-size: 1rem;
      transition: all 0.2s;
      font-family: inherit;
    }

    .btn-primary {
      background-color: #212121;
      color: #fff;
      box-shadow: 4px 4px 0 rgba(0,0,0,0.2);

      &:hover:not(:disabled) {
        transform: translate(-2px, -2px);
        box-shadow: 6px 6px 0 rgba(0,0,0,0.3);
      }

      &:active:not(:disabled) {
        transform: translate(0, 0);
        box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
      }
    }
  `]
})
export class CollectionFormComponent {
    @Output() collectionCreated = new EventEmitter<void>();

    collectionName = '';
    errorMessage = signal('');

    private collectionService = inject(CollectionService);

    create(): void {
        if (!this.collectionName.trim()) return;

        const success = this.collectionService.addCollection(this.collectionName.trim());
        if (success) {
            this.collectionCreated.emit();
            this.collectionName = '';
            this.errorMessage.set('');
        } else {
            this.errorMessage.set('Esta categoría ya existe.');
        }
    }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="update-notification" [class.collapsed]="!isExpanded">
      <div class="update-content">
        <span class="update-icon">🚀</span>
        <div class="update-text" [class.hidden]="!isExpanded">
          <p class="update-title">¡Nueva versión disponible!</p>
          <p class="update-message">Actualiza para ver los cambios.</p>
        </div>
      </div>
      <div class="actions">
        <button class="update-btn" (click)="reload.emit()">
          {{ isExpanded ? 'ACTUALIZAR' : '↻' }}
        </button>
        <button class="toggle-btn" (click)="toggle()" [attr.aria-label]="isExpanded ? 'Colapsar' : 'Expandir'">
          <span class="chevron" [class.rotated]="!isExpanded">▼</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .update-notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #2d5016;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      z-index: 2000;
      animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 2px solid #fbc02d;
      min-width: 300px;
      justify-content: space-between;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .update-notification.collapsed {
      min-width: auto;
      padding: 0.75rem 1rem;
      gap: 1rem;
      border-radius: 50px;
    }

    .update-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .update-icon {
      font-size: 1.5rem;
    }

    .update-text {
      display: flex;
      flex-direction: column;
      transition: opacity 0.2s ease, width 0.3s ease;
      white-space: nowrap;
      opacity: 1;
      width: auto;
    }

    .update-text.hidden {
      opacity: 0;
      width: 0;
      overflow: hidden;
      margin: 0;
    }

    .update-title {
      margin: 0;
      font-weight: 800;
      font-size: 0.95rem;
      text-transform: uppercase;
      color: #fbc02d;
    }

    .update-message {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.9;
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .update-btn {
      background-color: #fbc02d;
      color: #2d5016;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;

      &:hover {
        background-color: #fff;
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .toggle-btn {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;

        &:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
        }
    }

    .chevron {
        display: inline-block;
        font-size: 0.8rem;
        transition: transform 0.3s ease;
    }

    .chevron.rotated {
        transform: rotate(180deg);
    }

    @keyframes slideUp {
      from {
        transform: translate(-50%, 100px);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .update-notification {
        width: 90%;
        bottom: 10px;
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .update-notification.collapsed {
        width: auto;
        flex-direction: row;
      }

      .update-content {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .update-notification.collapsed .update-content {
        flex-direction: row;
      }

      .update-btn {
        width: 100%;
      }
      
      .update-notification.collapsed .update-btn {
        width: auto;
      }

      .actions {
        width: 100%;
        justify-content: center;
      }

      .update-notification.collapsed .actions {
        width: auto;
      }
    }
  `]
})
export class UpdateNotificationComponent {
  @Output() reload = new EventEmitter<void>();
  isExpanded = true;

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}

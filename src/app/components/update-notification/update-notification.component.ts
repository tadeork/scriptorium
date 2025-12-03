import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-update-notification',
    standalone: true,
    template: `
    <div class="update-notification">
      <div class="update-content">
        <span class="update-icon">🚀</span>
        <div class="update-text">
          <p class="update-title">¡Nueva versión disponible!</p>
          <p class="update-message">Actualiza para ver los cambios.</p>
        </div>
      </div>
      <button class="update-btn" (click)="reload.emit()">
        ACTUALIZAR
      </button>
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

      &:hover {
        background-color: #fff;
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
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

      .update-content {
        flex-direction: column;
        gap: 0.5rem;
      }

      .update-btn {
        width: 100%;
      }
    }
  `]
})
export class UpdateNotificationComponent {
    @Output() reload = new EventEmitter<void>();
}

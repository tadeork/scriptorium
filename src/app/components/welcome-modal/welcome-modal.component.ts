import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalOverlayComponent } from '../modal-overlay/modal-overlay.component';

@Component({
    selector: 'app-welcome-modal',
    standalone: true,
    imports: [CommonModule, ModalOverlayComponent],
    templateUrl: './welcome-modal.component.html',
    styleUrl: './welcome-modal.component.scss'
})
export class WelcomeModalComponent implements OnInit {
    @Output() closed = new EventEmitter<void>();
    isOpen = false;
    userName = signal('');
    errorMessage = signal('');

    ngOnInit(): void {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        this.userName.set(localStorage.getItem('userName') || '');
        if (!hasSeenWelcome) {
            // Small delay to ensure smooth entrance animation
            setTimeout(() => {
                this.isOpen = true;
            }, 500);
        }
    }

    closeModal(): void {
        if (!this.validateName()) {
            return;
        }
        this.isOpen = false;
        localStorage.setItem('hasSeenWelcome', 'true');
        localStorage.setItem('userName', this.userName().trim());
        this.closed.emit();
    }

    validateName(): boolean {
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!this.userName() || !this.userName().trim()) {
            this.errorMessage.set('Por favor, ingresa tu nombre.');
            return false;
        }
        if (!nameRegex.test(this.userName())) {
            this.errorMessage.set('El nombre solo debe contener letras.');
            return false;
        }
        this.errorMessage.set('');
        return true;
    }

    open(): void {
        this.isOpen = true;
    }

    onNameInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.userName.set(input.value);
        if (this.errorMessage()) {
            this.validateName();
        }
    }
}

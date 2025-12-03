import { Component, OnInit } from '@angular/core';
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
    isOpen = false;

    ngOnInit(): void {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            // Small delay to ensure smooth entrance animation
            setTimeout(() => {
                this.isOpen = true;
            }, 500);
        }
    }

    closeModal(): void {
        this.isOpen = false;
        localStorage.setItem('hasSeenWelcome', 'true');
    }
}

import { Injectable, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class CollectionService {
    private collections = signal<string[]>([]);
    readonly collections$ = this.collections.asReadonly();

    constructor(private storageService: LocalStorageService) {
        this.loadCollections();
    }

    private loadCollections(): void {
        const stored = this.storageService.loadCollections();
        this.collections.set(stored);
    }

    addCollection(name: string): boolean {
        const current = this.collections();
        if (current.includes(name)) {
            return false; // Already exists
        }
        const updated = [...current, name];
        this.collections.set(updated);
        this.storageService.saveCollections(updated);
        return true;
    }

    deleteCollection(name: string): void {
        const current = this.collections();
        const updated = current.filter(c => c !== name);
        this.collections.set(updated);
        this.storageService.saveCollections(updated);
    }

    renameCollection(oldName: string, newName: string): boolean {
        const current = this.collections();
        if (current.includes(newName)) {
            return false; // New name already exists
        }

        const updated = current.map(c => c === oldName ? newName : c);
        this.collections.set(updated);
        this.storageService.saveCollections(updated);
        return true;
    }
}

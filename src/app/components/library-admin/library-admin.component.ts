import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';

@Component({
    selector: 'app-library-admin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './library-admin.component.html',
    styleUrls: ['./library-admin.component.scss']
})
export class LibraryAdminComponent {
    @Output() close = new EventEmitter<void>();
    @Output() showWelcome = new EventEmitter<void>();

    constructor(private bookService: BookService) { }

    downloadLibrary(): void {
        const books = this.bookService.books$();
        if (books.length === 0) {
            alert('No hay libros para exportar.');
            return;
        }

        const csvContent = this.convertToCSV(books);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'library_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    triggerUpload(): void {
        const fileInput = document.getElementById('csvUpload') as HTMLInputElement;
        fileInput.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) {
            return;
        }

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const books = this.parseCSV(text);
                this.bookService.importBooks(books);
                alert('Biblioteca cargada exitosamente.');
                this.close.emit();
            } catch (error) {
                console.error('Error parsing CSV', error);
                alert('Error al leer el archivo CSV. Asegúrate de que el formato sea correcto.');
            }
        };

        reader.readAsText(file);
        // Reset input so the same file can be selected again if needed
        input.value = '';
    }

    private convertToCSV(books: Book[]): string {
        const headers = [
            'id', 'title', 'author', 'isbn', 'coverImageUrl', 'collection',
            'status', 'pagesRead', 'pages', 'publishedDate', 'description',
            'createdAt', 'updatedAt'
        ];

        const rows = books.map(book => {
            return headers.map(header => {
                const value = (book as any)[header];
                // Handle strings that might contain commas or quotes
                if (typeof value === 'string') {
                    const escaped = value.replace(/"/g, '""');
                    return `"${escaped}"`;
                }
                return value !== undefined && value !== null ? value : '';
            }).join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    }

    private parseCSV(csvText: string): Book[] {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const books: Book[] = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i];
            // Simple CSV parsing (doesn't handle newlines within fields perfectly, but sufficient for this use case)
            // We need to handle quoted strings properly though
            const values = this.splitCSVLine(currentLine);

            if (values.length !== headers.length) {
                console.warn(`Skipping line ${i + 1}: expected ${headers.length} values, got ${values.length}`);
                continue;
            }

            const book: any = {};
            headers.forEach((header, index) => {
                let value = values[index];
                // Convert types
                if (header === 'pages' || header === 'pagesRead' || header === 'createdAt' || header === 'updatedAt') {
                    book[header] = value ? Number(value) : undefined;
                } else {
                    book[header] = value;
                }
            });

            books.push(book as Book);
        }

        return books;
    }

    // Helper to split CSV line respecting quotes
    private splitCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (i + 1 < line.length && line[i + 1] === '"') {
                    // Double quote inside quotes -> literal quote
                    current += '"';
                    i++;
                } else {
                    // Toggle quotes
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }
}

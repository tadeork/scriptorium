import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly BOOKS_KEY = 'scriptorium_books';

  saveBooks(books: Book[]): void {
    try {
      localStorage.setItem(this.BOOKS_KEY, JSON.stringify(books));
    } catch (error) {
      console.error('Error saving books to localStorage', error);
    }
  }

  loadBooks(): Book[] {
    try {
      const stored = localStorage.getItem(this.BOOKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading books from localStorage', error);
      return [];
    }
  }

  clearBooks(): void {
    try {
      localStorage.removeItem(this.BOOKS_KEY);
    } catch (error) {
      console.error('Error clearing books from localStorage', error);
    }
  }
}

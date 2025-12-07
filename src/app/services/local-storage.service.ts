import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly BOOKS_KEY = 'scriptorium_books';
  private readonly COLLECTIONS_KEY = 'scriptorium_collections';
  private readonly USER_NAME_KEY = 'userName';

  saveUserName(name: string): void {
    try {
      localStorage.setItem(this.USER_NAME_KEY, name);
    } catch (error) {
      console.error('Error saving user name to localStorage', error);
    }
  }

  getUserName(): string | null {
    try {
      return localStorage.getItem(this.USER_NAME_KEY);
    } catch (error) {
      console.error('Error loading user name from localStorage', error);
      return null;
    }
  }


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

  saveCollections(collections: string[]): void {
    try {
      localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(collections));
    } catch (error) {
      console.error('Error saving collections to localStorage', error);
    }
  }

  loadCollections(): string[] {
    try {
      const stored = localStorage.getItem(this.COLLECTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading collections from localStorage', error);
      return [];
    }
  }
}

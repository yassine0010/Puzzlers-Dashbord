import { Injectable, signal } from '@angular/core';

/**
 * ThemeService
 * Professional light/dark mode manager.
 * - Applies data-theme attribute to <html>
 * - Persists preference (localStorage)
 * - Defaults to system preference on first load
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme';
  readonly theme = signal<'light' | 'dark'>('light');

  constructor() {
    const initial = this.detectInitial();
    this.apply(initial);
  }

  toggle(): void {
    this.apply(this.theme() === 'light' ? 'dark' : 'light');
  }

  set(mode: 'light' | 'dark'): void {
    this.apply(mode);
  }

  private detectInitial(): 'light' | 'dark' {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  }

  private apply(mode: 'light' | 'dark'): void {
    this.theme.set(mode);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
    }
    try {
      localStorage.setItem(this.storageKey, mode);
    } catch {}
  }
}

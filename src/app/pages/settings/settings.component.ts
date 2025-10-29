import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="settings-shell">
      <div class="settings-header">
        <h2>Settings</h2>
        <a routerLink="/dashboard" class="btn ghost return" aria-label="Return to dashboard"
          >← Return</a
        >
      </div>
      <div class="card">
        <h3>Appearance</h3>
        <p class="muted">Choose your preferred theme for the admin console.</p>
        <div class="theme-options" role="radiogroup" aria-label="Theme options">
          <button
            type="button"
            role="radio"
            class="theme-option"
            [class.active]="theme.theme() === 'light'"
            [attr.aria-checked]="theme.theme() === 'light'"
            (click)="selectTheme('light')"
          >
            <span class="option-title">Light</span>
            <span class="option-desc">Bright panels and sharp contrast.</span>
          </button>
          <button
            type="button"
            role="radio"
            class="theme-option"
            [class.active]="theme.theme() === 'dark'"
            [attr.aria-checked]="theme.theme() === 'dark'"
            (click)="selectTheme('dark')"
          >
            <span class="option-title">Dark</span>
            <span class="option-desc">Dimmed surfaces for low light.</span>
          </button>
        </div>
        <div class="muted">Current: {{ theme.theme() }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        /* prevent text selection/copy by default */
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      .settings-shell {
        max-width: 840px;
        margin: 0 auto;
      }
      .settings-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .muted {
        color: var(--text-secondary);
      }
      .card {
        background: var(--surface-panel);
        border: 1px solid var(--surface-panel-border);
        padding: 1rem;
        border-radius: 8px;
        margin-top: 0.6rem;
      }
      .theme-options {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.75rem;
        flex-wrap: wrap;
      }
      .theme-option {
        flex: 1 1 200px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        border: 1px solid var(--surface-panel-border);
        background: var(--surface-field);
        color: var(--text-primary);
        transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      }
      .theme-option:hover {
        border-color: var(--brand-blue-cyan);
        box-shadow: 0 6px 18px rgba(4, 105, 221, 0.12);
        transform: translateY(-1px);
      }
      .theme-option.active {
        border-color: var(--brand-blue-dark);
        box-shadow: 0 10px 24px rgba(4, 105, 221, 0.15);
      }
      .option-title {
        font-weight: 600;
      }
      .option-desc {
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      .btn {
        background: linear-gradient(135deg, var(--brand-blue-dark), var(--brand-blue-cyan));
        color: var(--brand-white);
        border: none;
        padding: 0.5rem 0.85rem;
        border-radius: 6px;
        cursor: pointer;
      }
      /* allow selection inside interactive controls */
      button,
      input,
      textarea,
      select {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      .btn.ghost {
        background: transparent;
        color: var(--text-primary);
        border: 1px solid var(--surface-panel-border);
        padding: 0.45rem 0.75rem;
      }
      .btn.ghost.return {
        margin: 0.5rem;
        padding: 0.5rem 0.9rem;
        font-size: 0.95rem;
        line-height: 1;
      }
    `,
  ],
})
export class SettingsComponent {
  protected theme = inject(ThemeService);

  protected selectTheme(mode: 'light' | 'dark'): void {
    this.theme.set(mode);
  }
}

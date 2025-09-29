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
        <div style="display:flex;align-items:center;gap:.75rem;margin-top:.6rem">
          <button
            class="btn"
            (click)="theme.toggle()"
            [attr.aria-pressed]="theme.theme() === 'dark'"
            aria-label="Toggle theme"
          >
            {{ theme.theme() === 'light' ? 'Switch to Dark' : 'Switch to Light' }}
          </button>
          <div class="muted">Current: {{ theme.theme() }}</div>
        </div>
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
}

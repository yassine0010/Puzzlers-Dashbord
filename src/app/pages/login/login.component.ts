import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-shell">
      <div class="theme-switch-container">
        <button
          type="button"
          class="theme-toggle"
          (click)="theme.toggle()"
          [attr.aria-label]="
            theme.theme() === 'light' ? 'Activate dark mode' : 'Activate light mode'
          "
        >
          <!-- Inline minimal SVG icons (no emojis) -->
          @if (theme.theme() === 'light') {
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M12 3.75a.75.75 0 0 1 .75.75 6.75 6.75 0 0 0 6.75 6.75.75.75 0 0 1 0 1.5A6.75 6.75 0 0 0 12.75 19.5a.75.75 0 0 1-1.5 0A6.75 6.75 0 0 0 4.5 12.75a.75.75 0 0 1 0-1.5A6.75 6.75 0 0 0 11.25 4.5.75.75 0 0 1 12 3.75Z"
            />
          </svg>
          <span class="toggle-label">Dark</span>
          } @else {
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm0-16.5a.75.75 0 0 1 .75.75V4a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5Zm0 17.25a.75.75 0 0 1 .75.75V22a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM4 11.25a.75.75 0 0 1 .75.75.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1 0-1.5H4Zm17.75 0a.75.75 0 0 1 0 1.5H20a.75.75 0 0 1 0-1.5h1.75ZM6.07 5.51a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06L6.07 6.57a.75.75 0 0 1 0-1.06Zm9.74 9.74a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM5.51 17.93a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06Zm9.74-9.74a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06Z"
            />
          </svg>
          <span class="toggle-label">Light</span>
          }
        </button>
      </div>
      <div class="auth-panel">
        <div class="brand-pane">
          <div class="brand-inner">
            <img
              class="brand-logo"
              [attr.src]="theme.theme() === 'dark' ? '/assets/blanc.png' : '/assets/Groupe 170.png'"
              alt="IEEE Puzzlers"
              decoding="async"
            />
            <div class="brand-copy">
              <h1 class="brand-title">IEEE Puzzlers - Admin Console</h1>
              <p class="brand-text">Manage puzzles and platform operations securely.</p>
            </div>
          </div>
        </div>
        <div class="form-pane">
          <div class="form-header">
            <h2>Sign in</h2>
            <p>Please enter your credentials to continue.</p>
          </div>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="form-body">
            @if (authService.error()) {
            <div class="alert alert-error">
              <span class="alert-icon" aria-hidden="true">!</span>
              <div class="alert-msg">{{ authService.error() }}</div>
              <button
                type="button"
                (click)="authService.clearError()"
                class="alert-close"
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
            }
            <div class="field-group" [class.invalid]="isFieldInvalid('userName')">
              <label for="userName">Username</label>
              <input
                id="userName"
                type="text"
                formControlName="userName"
                placeholder="admin or jdoe"
                autocomplete="username"
              />
              @if (isFieldInvalid('userName')) {
              <span class="field-hint">
                @if (loginForm.get('userName')?.errors?.['required']) { Required }
              </span>
              }
            </div>
            <div class="field-group" [class.invalid]="isFieldInvalid('password')">
              <label for="password">Password</label>
              <div class="password-wrapper">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="toggle-pass"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                >
                  @if (showPassword()) {
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      fill="currentColor"
                      d="M2.47 2.47a.75.75 0 0 1 1.06 0l18 18a.75.75 0 0 1-1.06 1.06l-2.614-2.614A11.5 11.5 0 0 1 12 20.25c-5.523 0-9.843-3.906-11.63-8.57a1.96 1.96 0 0 1 0-1.36A13.18 13.18 0 0 1 4.73 6.28L2.47 4.03a.75.75 0 0 1 0-1.06ZM7.53 9.09A4.5 4.5 0 0 0 12 16.5a4.46 4.46 0 0 0 2.41-.705l-1.53-1.53a2.75 2.75 0 0 1-3.646-3.646L7.53 9.09Zm5.228 1.288 3.36 3.36A4.48 4.48 0 0 0 16.5 12a4.5 4.5 0 0 0-3.742-4.445 7.3 7.3 0 0 1 .258 2.322c0 .18-.005.357-.014.533-.17.024-.339.055-.5.092-.55.124-.822.195-1.244.374Z"
                    />
                  </svg>
                  } @else {
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      fill="currentColor"
                      d="M12 5c5.523 0 9.843 3.906 11.63 8.57.17.44.17.92 0 1.36C21.843 19.594 17.523 23.5 12 23.5S2.157 19.594.37 14.93a1.96 1.96 0 0 1 0-1.36C2.157 8.906 6.477 5 12 5Zm0 2.25c-4.43 0-8.24 3.118-9.89 7.25 1.65 4.132 5.46 7.25 9.89 7.25 4.43 0 8.24-3.118 9.89-7.25-1.65-4.132-5.46-7.25-9.89-7.25Zm0 2.25a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
                    />
                  </svg>
                  }
                </button>
              </div>
              @if (isFieldInvalid('password')) { <span class="field-hint">Required</span> }
            </div>
            <div class="actions">
              <button
                type="submit"
                class="btn-primary"
                [disabled]="loginForm.invalid || authService.loading()"
              >
                @if (authService.loading()) {
                <span class="spinner" aria-hidden="true"></span> Signing in... } @else { Sign In }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* --- Layout Shell --- */
      .auth-shell {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-10) var(--space-4);
        background: var(--surface-app);
      }
      .auth-panel {
        width: 100%;
        max-width: 900px;
        background: var(--surface-panel);
        display: grid;
        grid-template-columns: 420px 1fr;
        border: 1px solid var(--surface-panel-border);
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: var(--surface-elevated-shadow);
        transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
      }

      /* --- Brand Side (tight spacing / higher placement) --- */
      .brand-pane {
        position: relative;
        background: var(--surface-panel);
        border-right: 1px solid var(--surface-panel-border);
        display: flex;
      }
      .brand-inner {
        padding: 3rem 2.1rem 2.25rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      /* Logo */
      .brand-logo {
        height: 5.2rem;
        width: auto;
        object-fit: contain;
        display: block;
        transition: opacity 0.25s ease;
      }
      /* Wrapper for spacing under logo */
      .brand-copy {
        margin-top: 8.85rem; /* increased spacing between logo and first text block */
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .brand-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 500;
        letter-spacing: 0.25px;
        color: var(--heading-brand-color);
        line-height: 1.05;
        transition: color 0.25s ease;
      }

      .brand-text {
        margin: 0;
        font-size: 0.7rem;
        line-height: 1.38;
        max-width: 290px;
        color: var(--text-secondary);
      }
      .brand-inner,
      .brand-inner .brand-title,
      .brand-inner .brand-sub,
      .brand-inner .brand-text {
        -webkit-user-select: none;
        user-select: none;
      }

      /* --- Form Side --- */
      .form-pane {
        padding: 3rem 2.75rem 2.75rem;
        display: flex;
        flex-direction: column;
      }
      .form-header h2 {
        margin: 0 0 0.4rem;
        font-size: 1.4rem;
        font-weight: 600;
        letter-spacing: 0.3px;
        color: var(--text-primary);
      }
      .form-header p {
        margin: 0 0 2rem;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      /* Make form header decorative text unselectable */
      .form-header h2,
      .form-header p {
        -webkit-user-select: none;
        user-select: none;
      }
      .form-body {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      /* --- Alerts --- */
      .alert {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.85rem 1rem;
        border: 1px solid;
        border-radius: var(--radius-md);
        font-size: 0.75rem;
        line-height: 1.35;
        position: relative;
      }
      .alert-error {
        background: var(--surface-panel);
        border-color: var(--surface-panel-border);
        color: var(--color-error);
      }
      .alert-icon {
        font-weight: 700;
        width: 1rem;
        display: inline-flex;
        justify-content: center;
      }
      .alert-close {
        position: absolute;
        top: 4px;
        right: 6px;
        background: none;
        border: none;
        font-size: 1rem;
        line-height: 1;
        cursor: pointer;
        color: inherit;
        padding: 2px 4px;
      }

      /* --- Fields --- */
      .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .field-group label {
        font-size: 0.65rem;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-secondary);
      }
      /* Component-level styles should use design tokens; dark-mode token lives in brand.css */
      .field-group input {
        border: 1px solid var(--surface-field-border);
        background: var(--surface-field);
        padding: 0.8rem 0.85rem;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        font-family: inherit;
        transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
        color: var(--text-primary);
      }
      .field-group input:focus {
        outline: none;
        border-color: var(--brand-blue-dark);
        box-shadow: 0 0 0 3px var(--focus-ring-color);
      }
      .field-group.invalid input {
        border-color: var(--color-error);
      }
      .field-hint {
        color: var(--color-error);
        font-size: 0.65rem;
        letter-spacing: 0.3px;
      }
      .password-wrapper {
        position: relative;
        display: flex;
      }
      .password-wrapper input {
        flex: 1;
      }
      .toggle-pass {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        font-size: 0.9rem;
        padding: 0.35rem 0.4rem;
        border-radius: var(--radius-sm);
        cursor: pointer;
        color: #64748b;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .toggle-pass:hover {
        color: var(--brand-blue-dark);
      }

      /* --- Actions --- */
      .actions {
        margin-top: 1rem;
      }
      .btn--xl {
        padding: 1rem 1.25rem;
        font-size: 0.95rem;
        font-weight: 600;
      }
      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* --- Responsive --- */
      @media (max-width: 960px) {
        .auth-panel {
          grid-template-columns: 1fr;
          max-width: 560px;
        }
        .brand-pane {
          display: none;
        }
        .form-pane {
          padding: 2.5rem 2rem 2rem;
        }
      }
      @media (max-width: 520px) {
        .auth-shell {
          padding: var(--space-6) var(--space-3);
        }
        .form-pane {
          padding: 2rem 1.5rem 1.75rem;
        }
        .brand-logo {
          height: 3.25rem;
        }
      }
      /* Theme toggle (professional, no emojis) */
      .theme-switch-container {
        position: absolute;
        top: 1rem;
        right: 1rem;
        z-index: 10;
      }
      .theme-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        background: var(--surface-panel);
        color: var(--text-secondary);
        border: 1px solid var(--surface-panel-border);
        padding: 0.4rem 0.65rem;
        border-radius: var(--radius-md);
        cursor: pointer;
        line-height: 1;
        transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease,
          box-shadow 0.2s ease;
      }
      .theme-toggle:hover {
        color: var(--text-primary);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      }
      .theme-toggle:focus-visible {
        outline: 2px solid var(--brand-blue-dark);
        outline-offset: 2px;
      }
      .toggle-label {
        font-size: 0.65rem;
      }
    `,
  ],
})
export class LoginComponent {
  protected authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected theme = inject(ThemeService);

  protected showPassword = signal(false);

  protected loginForm: FormGroup = this.fb.group({
    userName: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor() {
    // Redirect if already authenticated
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((show) => !show);
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      this.authService.login(credentials).subscribe();
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}

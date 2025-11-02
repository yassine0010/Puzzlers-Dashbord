import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { PuzzleItem, PuzzlesService } from '../../core/services/puzzles.service';
import { AdminUserSummary } from '../../shared/models/auth.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="dash-shell">
      <header class="dash-header">
        <div class="brand">
          <h1>IEEE Puzzlers — Dashboard</h1>
          <p class="subtitle">Admin console and creator tools</p>
        </div>
        <div class="header-actions">
          <div class="welcome">
            <div class="welcome-text">
              Welcome, <strong>{{ auth.user()?.userName }}</strong>
            </div>
            <div class="role-badge">{{ auth.roles().join(' • ') }}</div>
          </div>
          <div class="header-buttons">
            <button class="btn" (click)="auth.logout()">Sign out</button>
          </div>
        </div>
      </header>

      <div class="dash-body">
        <aside class="dash-sidebar">
          <h3>Navigation</h3>
          <nav class="dash-nav">
            <a
              class="nav-link"
              routerLink="/dashboard"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              >Overview</a
            >
            <a class="nav-link" routerLink="/settings" routerLinkActive="active">Settings</a>
          </nav>
        </aside>

        <section class="dash-content">
          <div class="hero card">
            <div class="hero-left">
              <h2>Hello {{ auth.user()?.userName }},</h2>
              <p class="muted">Quick actions and overview of your workspace</p>
            </div>
            <div class="hero-right" *ngIf="isAdmin()">
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">{{ getUserCount() }}</div>
                  <div class="stat-label">Total Users</div>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="isAdmin()" class="admin-panel">
            <div class="card">
              <div class="card-header">
                <h3>Manage Users</h3>
              </div>
              <div class="admin-form">
                <input
                  placeholder="Username"
                  [(ngModel)]="newUserName"
                  (ngModelChange)="resetAdminMessages()"
                />
                <div class="password-field">
                  <input
                    [type]="showAdminPassword() ? 'text' : 'password'"
                    placeholder="Password"
                    [(ngModel)]="newUserPassword"
                    (ngModelChange)="resetAdminMessages()"
                  />
                  <button
                    type="button"
                    class="toggle-pass"
                    (click)="toggleAdminPassword()"
                    [attr.aria-label]="showAdminPassword() ? 'Hide password' : 'Show password'"
                  >
                    {{ showAdminPassword() ? 'Hide' : 'Show' }}
                  </button>
                </div>
                <select [(ngModel)]="newUserRole" (ngModelChange)="resetAdminMessages()">
                  <option value="GAME_CREATOR">Game Creator</option>
                  <option value="PUZZLE_CREATOR">Puzzle Creator</option>
                  <option value="GAMER">Gamer</option>
                </select>
                <button class="btn" (click)="createUser()" [disabled]="creatingUser()">
                  {{ creatingUser() ? 'Creating...' : 'Add User' }}
                </button>
              </div>
              <div class="policy-hint">
                Username must use letters and digits only (no spaces or symbols). Password requires
                uppercase, lowercase, number, and symbol.
              </div>
              <div *ngIf="userFormError() as error" class="field-error">{{ error }}</div>
              <div *ngIf="userFormMessage() as message" class="success-msg">{{ message }}</div>

              <ul class="user-list">
                <li *ngFor="let user of users()">
                  <div class="user-info">
                    <div class="uname">{{ user.userName }}</div>
                    <div class="muted">{{ (user.roles || []).join(', ') }}</div>
                  </div>
                  <button
                    type="button"
                    class="btn ghost small"
                    (click)="deleteUser(user)"
                    [disabled]="deletingUserId() === user.id"
                  >
                    {{ deletingUserId() === user.id ? 'Deleting…' : 'Delete' }}
                  </button>
                </li>
              </ul>
              <div *ngIf="users().length === 0" class="muted">No users yet.</div>
            </div>
          </div>
          <div *ngIf="!isAdmin()" class="creator-panel">
            <div class="card">
              <h3>Create a New Puzzle</h3>
              <div class="form-row">
                <input
                  placeholder="Name"
                  [(ngModel)]="newPuzzleName"
                  (ngModelChange)="newPuzzleNameError = false; resetPuzzleMessages()"
                  required
                />
                <select [(ngModel)]="newPuzzleDifficulty" (ngModelChange)="resetPuzzleMessages()">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div *ngIf="newPuzzleNameError" class="field-error">Name is required</div>
              <div style="margin-top:.75rem">
                <label class="sr-only">Puzzle image</label>
                <input
                  id="puzzle-image-input"
                  type="file"
                  accept="image/*"
                  (change)="onImageSelected($event)"
                />
              </div>
              <div *ngIf="newPuzzleImageError" class="field-error">Image is required</div>
              <div *ngIf="puzzleFormError() as puzzleError" class="field-error">
                {{ puzzleError }}
              </div>
              <textarea
                placeholder="Solution"
                [(ngModel)]="newPuzzleSolution"
                (ngModelChange)="newPuzzleSolutionError = false; resetPuzzleMessages()"
                required
              ></textarea>
              <div *ngIf="newPuzzleSolutionError" class="field-error">Solution is required</div>

              <!-- Create button placed under the Solution field (green success style) -->
              <div style="margin-top:.75rem">
                <button class="btn success" (click)="addPuzzle()" [disabled]="creatingPuzzle()">
                  {{ creatingPuzzle() ? 'Creating...' : 'Create' }}
                </button>
              </div>
              <div *ngIf="puzzleFormMessage() as puzzleMessage" class="success-msg">
                {{ puzzleMessage }}
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3>All Puzzles</h3>
                <button
                  type="button"
                  class="btn ghost small"
                  (click)="refreshAllPuzzles()"
                  [disabled]="allPuzzlesLoading()"
                >
                  {{ allPuzzlesLoading() ? 'Refreshing…' : 'Refresh' }}
                </button>
              </div>
              <div *ngIf="allPuzzlesError() as allError" class="field-error">
                {{ allError }}
              </div>
              <div *ngIf="allPuzzlesLoading()" class="muted">Loading puzzles…</div>
              <ul class="puzzle-list" *ngIf="!allPuzzlesLoading() && allPuzzles().length > 0">
                <li *ngFor="let puzzle of allPuzzles()">
                  <div class="p-info">
                    <div class="uname">{{ puzzle.name }}</div>
                    <div class="muted">
                      Difficulty: {{ puzzle.difficultyLevel | titlecase }}
                      <span *ngIf="puzzle.createdBy">
                        • Creator: {{ getCreatorName(puzzle) }}
                      </span>
                    </div>
                    <div class="muted">Solution: {{ puzzle.solution }}</div>
                  </div>
                  <img
                    *ngIf="puzzle.image"
                    [src]="puzzle.image"
                    alt="Puzzle preview"
                    class="p-thumb"
                    (click)="openLightbox(puzzle.image)"
                  />
                </li>
              </ul>
              <div
                *ngIf="!allPuzzlesLoading() && allPuzzles().length === 0"
                class="muted puzzle-empty"
              >
                No puzzles available yet.
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3>Your Puzzles</h3>
                <button
                  type="button"
                  class="btn ghost small"
                  (click)="refreshCreatorPuzzles()"
                  [disabled]="puzzlesLoading()"
                >
                  {{ puzzlesLoading() ? 'Refreshing…' : 'Refresh' }}
                </button>
              </div>
              <div *ngIf="puzzlesError() as creatorError" class="field-error">
                {{ creatorError }}
              </div>
              <div *ngIf="puzzlesLoading()" class="muted">Loading puzzles…</div>
              <ul class="puzzle-list" *ngIf="!puzzlesLoading() && creatorPuzzles().length > 0">
                <li *ngFor="let puzzle of creatorPuzzles()">
                  <div class="p-info">
                    <div class="uname">{{ puzzle.name }}</div>
                    <div class="muted">Difficulty: {{ puzzle.difficultyLevel | titlecase }}</div>
                    <div class="muted">Solution: {{ puzzle.solution }}</div>
                  </div>
                  <img
                    *ngIf="puzzle.image"
                    [src]="puzzle.image"
                    alt="Puzzle preview"
                    class="p-thumb"
                    (click)="openLightbox(puzzle.image)"
                  />
                  <button
                    type="button"
                    class="btn ghost small"
                    (click)="deleteCreatorPuzzle(puzzle)"
                    [disabled]="deletingPuzzleId() === puzzle.id"
                  >
                    {{ deletingPuzzleId() === puzzle.id ? 'Deleting…' : 'Delete' }}
                  </button>
                </li>
              </ul>
              <div
                *ngIf="!puzzlesLoading() && creatorPuzzles().length === 0"
                class="muted puzzle-empty"
              >
                You have not created any puzzles yet.
              </div>
            </div>
          </div>

          <div
            *ngIf="lightboxImage() as activeImage"
            class="puzzle-lightbox-backdrop"
            (click)="closeLightbox()"
          >
            <img
              [src]="activeImage"
              alt="Puzzle"
              class="puzzle-lightbox-image"
              (click)="$event.stopPropagation()"
            />
            <button type="button" class="puzzle-lightbox-close" (click)="closeLightbox()">
              &times;
            </button>
          </div>

          <!-- Creator puzzle list populated from backend -->
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: var(--surface-app);
        color: var(--text-primary);
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
        /* disable text selection/copy by default */
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      .dash-shell {
        max-width: 1200px;
        margin: 2rem auto;
      }

      .dash-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        background: linear-gradient(90deg, rgba(4, 105, 221, 0.04), transparent);
        border-bottom: 1px solid var(--surface-panel-border);
      }
      .admin-form {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      .password-field {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 320px;
      }
      .password-field input {
        flex: 1;
        padding-right: 4.5rem;
      }
      .password-field .toggle-pass {
        position: absolute;
        right: 0.35rem;
        background: transparent;
        border: none;
        color: var(--brand-blue-dark);
        cursor: pointer;
        padding: 0.25rem 0.55rem;
        font-size: 0.85rem;
      }
      .brand h1 {
        margin: 0;
        font-size: 1.25rem;
      }
      .brand .subtitle {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.85rem;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .welcome {
        text-align: right;
        margin-right: 0.5rem;
      }
      .welcome .welcome-text {
        font-size: 0.95rem;
      }
      .welcome .role-badge {
        font-size: 0.8rem;
        color: var(--brand-blue-cyan);
      }

      .header-buttons {
        display: flex;
        gap: 0.5rem;
      }

      .dash-body {
        display: grid;
        grid-template-columns: 240px 1fr;
        max-width: 1200px;
        margin: 1rem auto;
      }

      .dash-sidebar {
        padding: 1rem;
        border-right: 1px solid var(--surface-panel-border);
        background: transparent;
      }
      .dash-nav {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      /* Sidebar link style: simple stacked links (like the screenshot) */
      .dash-nav .nav-link {
        display: block;
        text-decoration: none;
        padding: 0.35rem 0;
        color: var(--brand-blue-cyan);
        font-size: 0.95rem;
        font-weight: 500;
        transition: color 0.12s ease, text-decoration 0.12s ease;
      }
      .dash-nav .nav-link:hover,
      .dash-nav .nav-link:focus {
        text-decoration: underline;
        color: var(--brand-blue-dark);
        outline: none;
      }
      .dash-nav .nav-link.active {
        color: var(--brand-blue-dark);
        font-weight: 700;
      }

      .muted {
        color: var(--text-secondary);
      }
      .action-row {
        margin-top: 0.75rem;
        display: flex;
        gap: 0.5rem;
      }
      .dash-content {
        margin: 1rem;
      }
      .stats {
        display: flex;
        gap: 0.75rem;
      }
      .stat {
        background: linear-gradient(180deg, rgba(4, 105, 221, 0.04), transparent);
        padding: 0.75rem 1rem;
        border-radius: 8px;
        text-align: right;
      }
      .stat-number {
        font-size: 1.2rem;
        font-weight: 700;
      }
      .stat-label {
        color: var(--text-secondary);
        font-size: 0.85rem;
      }

      .card {
        background: var(--surface-panel);
        border: 1px solid var(--surface-panel-border);
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem; /* increased spacing between stacked cards */
      }
      /* ensure consecutive cards have a bit of breathing room */
      .card + .card {
        margin-top: 0.6rem;
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      ul.user-list,
      ul.puzzle-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      ul.user-list li,
      ul.puzzle-list li {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.6rem 0;
        border-bottom: 1px dashed var(--surface-panel-border);
      }

      .p-info {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .p-thumb {
        width: 56px;
        height: 56px;
        object-fit: cover;
        border-radius: 6px;
        border: 1px solid var(--surface-panel-border);
        cursor: pointer;
      }

      .puzzle-lightbox-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        z-index: 9999;
      }

      .puzzle-lightbox-image {
        max-width: 90vw;
        max-height: 85vh;
        border-radius: 12px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
      }

      .puzzle-lightbox-close {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        width: 38px;
        height: 38px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.55);
        color: var(--brand-white);
        border: none;
        font-size: 1.6rem;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .puzzle-empty {
        text-align: center;
        padding: 0.75rem 0;
      }

      /* Puzzle item actions (Edit / Delete) should have some spacing */
      .p-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .form-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        max-width: 720px;
        flex-wrap: wrap;
      }
      .form-row input,
      .form-row select {
        width: auto;
        min-width: 160px;
        flex: 1 1 200px;
      }
      /* difficulty select: use input-like background and dark text so native dropdowns are readable */
      .form-row select {
        -webkit-appearance: none;
        appearance: none;
        background: var(--surface-field);
        color: var(--text-primary);
        border: 2px solid var(--brand-blue-dark);
        padding: 0.5rem 1.1rem 0.5rem 0.9rem;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.04);
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'><path d='M6 7l4 4 4-4' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.6'/></svg>");
        background-repeat: no-repeat;
        background-position: right 10px center;
        background-size: 14px 14px;
        line-height: 1.25;
      }

      /* best-effort readable option styling (may be platform-limited) */
      .form-row select option {
        color: var(--text-primary);
        background: var(--surface-panel);
      }
      .field-error {
        color: #c62828;
        font-size: 0.85rem;
        margin-top: 0.4rem;
      }
      .success-msg {
        color: var(--color-success, #158d45);
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
      }
      .policy-hint {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-bottom: 0.35rem;
      }

      /* re-enable selection for form controls so users can copy/paste inside inputs */
      input,
      textarea,
      select {
        width: 100%;
        padding: 0.5rem;
        border-radius: 6px;
        border: 1px solid var(--surface-field-border);
        background: var(--surface-field);
        color: var(--text-primary);
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      /* Buttons should not default to full-width; only inputs/textareas do. Override buttons used in compact form areas */
      button {
        padding: 0.5rem 0.9rem;
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
        width: auto; /* take only necessary space */
        display: inline-block;
      }
      textarea {
        min-height: 88px;
      }

      /* Make file input look like the primary buttons and be readable in native dialogs */
      input[type='file'] {
        display: inline-block;
        width: auto;
        color: var(--text-primary);
        background: transparent;
        border: none;
        padding: 0;
      }

      /* Modern browsers: style the file selector button */
      input[type='file']::file-selector-button {
        margin-right: 0.6rem;
        padding: 0.45rem 0.8rem;
        border-radius: 6px;
        border: none;
        background: linear-gradient(135deg, var(--brand-blue-dark), var(--brand-blue-cyan));
        color: var(--brand-white);
        cursor: pointer;
      }

      /* WebKit: older blink browsers */
      input[type='file']::-webkit-file-upload-button {
        margin-right: 0.6rem;
        padding: 0.45rem 0.8rem;
        border-radius: 6px;
        border: none;
        background: linear-gradient(135deg, var(--brand-blue-dark), var(--brand-blue-cyan));
        color: var(--brand-white);
        cursor: pointer;
      }

      /* Ensure the filename area is readable on dark backgrounds */
      input[type='file']::-webkit-file-upload-text,
      input[type='file']::file-selector-button {
        color: var(--brand-white);
      }

      .btn {
        background: linear-gradient(135deg, var(--brand-blue-dark), var(--brand-blue-cyan));
        color: var(--brand-white);
        border: none;
        padding: 0.55rem 0.9rem;
        border-radius: 6px;
        cursor: pointer;
      }
      .btn.success {
        background: linear-gradient(135deg, var(--brand-mild-green), var(--brand-deep-green));
        color: var(--brand-white);
        border: none;
      }
      /* Ensure create button in creator card doesn't stretch */
      .creator-panel .card .btn.success {
        width: auto;
        padding: 0.45rem 0.8rem;
      }
      .btn.ghost {
        background: transparent;
        border: 1px solid var(--brand-blue-dark);
        color: var(--text-primary);
      }
      .btn.ghost.small {
        padding: 0.35rem 0.6rem;
        font-size: 0.85rem;
      }

      @media (max-width: 880px) {
        .dash-body {
          grid-template-columns: 1fr;
        }
        .dash-sidebar {
          display: none;
        }
      }
      /* Delete confirmation modal styles */
      .confirm-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.45);
        z-index: 9999;
      }
      .confirm-card {
        max-width: 420px;
        width: 100%;
        padding: 1rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }
      .confirm-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 0.5rem;
      }
    `,
  ],
})
export class DashboardComponent {
  protected auth = inject(AuthService);
  protected puzzlesService = inject(PuzzlesService);
  protected users = signal<AdminUserSummary[]>([]);
  protected creatorPuzzles = signal<PuzzleItem[]>([]);
  protected puzzlesLoading = signal(false);
  protected puzzlesError = signal<string | null>(null);
  protected allPuzzles = signal<PuzzleItem[]>([]);
  protected allPuzzlesLoading = signal(false);
  protected allPuzzlesError = signal<string | null>(null);
  protected creatorNames = signal<Record<string, string>>({});

  // new puzzle fields matching backend model
  protected newPuzzleName = '';
  protected newPuzzleSolution = '';
  protected newPuzzleDifficulty: 'hard' | 'medium' | 'easy' = 'easy';
  protected newPuzzleNameError = false;
  protected newPuzzleSolutionError = false;
  protected newPuzzleImageFile: File | null = null;
  protected newPuzzleImageError = false;
  protected creatingPuzzle = signal(false);
  protected puzzleFormError = signal<string | null>(null);
  protected puzzleFormMessage = signal<string | null>(null);
  protected deletingPuzzleId = signal<string | null>(null);
  protected lightboxImage = signal<string | null>(null);

  // admin user form
  protected newUserName = '';
  protected newUserPassword = '';
  protected newUserRole: 'PUZZLE_CREATOR' | 'GAME_CREATOR' | 'GAMER' = 'GAME_CREATOR';
  protected creatingUser = signal(false);
  protected userFormError = signal<string | null>(null);
  protected userFormMessage = signal<string | null>(null);
  protected deletingUserId = signal<string | null>(null);
  private adminPasswordVisible = signal(false);
  private readonly usernamePolicy = /^[A-Za-z0-9]+$/;
  private readonly passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  private creatorPuzzlesLoadedFor: string | null = null;
  private allPuzzlesLoaded = false;

  constructor() {
    // load initial data for authenticated users
    effect(() => {
      const authenticated = this.auth.isAuthenticated();
      const currentUser = this.auth.user();
      const admin = this.isAdmin();

      if (!authenticated) {
        this.users.set([]);
        this.creatorPuzzles.set([]);
        this.puzzlesError.set(null);
        this.creatorPuzzlesLoadedFor = null;
        this.allPuzzles.set([]);
        this.allPuzzlesError.set(null);
        this.allPuzzlesLoading.set(false);
        this.allPuzzlesLoaded = false;
        this.creatorNames.set({});
        return;
      }

      const currentUserName = currentUser?.userName;
      const currentUserId = currentUser?.id;
      if (currentUserId && currentUserName) {
        this.setCreatorName(currentUserId, currentUserName);
      }

      this.loadAllPuzzles();

      if (admin) {
        this.refreshUsers();
        this.creatorPuzzles.set([]);
        this.puzzlesError.set(null);
        this.creatorPuzzlesLoadedFor = null;
      } else {
        this.users.set([]);
        const creatorId = currentUser?.id ?? '';
        if (creatorId) {
          this.loadCreatorPuzzles(creatorId);
        } else {
          this.creatorPuzzles.set([]);
        }
      }
    });
  }

  isAdmin() {
    return this.auth.isAdmin();
  }

  protected showAdminPassword() {
    return this.adminPasswordVisible();
  }

  protected toggleAdminPassword() {
    this.adminPasswordVisible.update((visible) => !visible);
  }

  protected resetAdminMessages() {
    this.userFormError.set(null);
    this.userFormMessage.set(null);
  }

  protected resetPuzzleMessages() {
    this.puzzleFormError.set(null);
    this.puzzleFormMessage.set(null);
  }

  protected refreshCreatorPuzzles() {
    const creatorId = this.auth.user()?.id ?? '';
    if (creatorId) {
      this.loadCreatorPuzzles(creatorId, true);
      this.loadAllPuzzles(true);
    }
  }

  protected refreshAllPuzzles() {
    this.loadAllPuzzles(true);
  }

  protected getCreatorName(puzzle: PuzzleItem | string | null | undefined): string {
    // If puzzle object passed, check for creator name first
    if (puzzle && typeof puzzle === 'object') {
      if (puzzle.creatorName) {
        return puzzle.creatorName;
      }
      const creatorId = puzzle.createdBy;
      if (!creatorId) {
        return 'Unknown creator';
      }
      return this.lookupCreatorName(creatorId);
    }

    // If just an ID string passed
    const creatorId = puzzle;
    if (!creatorId) {
      return 'Unknown creator';
    }
    return this.lookupCreatorName(creatorId);
  }

  private lookupCreatorName(creatorId: string): string {
    const lookup = this.creatorNames();
    if (lookup[creatorId]) {
      return lookup[creatorId];
    }

    const current = this.auth.user();
    if (current?.id === creatorId) {
      if (current.userName) {
        this.setCreatorName(current.id, current.userName);
      }
      return 'You';
    }

    // If we have a creator ID but no name, show the ID
    return creatorId || 'Unknown creator';
  }

  protected deleteCreatorPuzzle(puzzle: PuzzleItem) {
    if (!puzzle?.id || this.deletingPuzzleId()) {
      return;
    }

    const confirmed = window.confirm(`Delete puzzle "${puzzle.name}"?`);
    if (!confirmed) {
      return;
    }

    this.puzzleFormError.set(null);
    this.puzzleFormMessage.set(null);
    this.deletingPuzzleId.set(puzzle.id);

    this.puzzlesService
      .delete(puzzle.id)
      .pipe(finalize(() => this.deletingPuzzleId.set(null)))
      .subscribe({
        next: () => {
          this.creatorPuzzles.update((list) => list.filter((item) => item.id !== puzzle.id));
          this.puzzleFormMessage.set(`Puzzle "${puzzle.name}" deleted.`);
          this.loadAllPuzzles(true);
        },
        error: (err) => {
          const errorText =
            typeof err?.error === 'string' ? err.error : err?.message ?? 'Failed to delete puzzle.';
          this.puzzleFormError.set(errorText);
        },
      });
  }

  protected openLightbox(image?: string | null) {
    if (!image) {
      return;
    }
    this.lightboxImage.set(image);
  }

  protected closeLightbox() {
    this.lightboxImage.set(null);
  }

  private refreshUsers() {
    this.auth.getAllUsers().subscribe({
      next: (list) => {
        const normalized = (list ?? []).map((u) => ({
          ...u,
          roles: Array.isArray(u.roles)
            ? u.roles
            : typeof (u as any).roles === 'string'
            ? (u as any).roles
                .split(',')
                .map((r: string) => r.trim())
                .filter(Boolean)
            : [],
        }));
        this.users.set(normalized);
        normalized.forEach((user) => {
          if (user.id && user.userName) {
            this.setCreatorName(user.id, user.userName);
          }
        });
      },
      error: () => this.users.set([]),
    });
  }

  private loadAllPuzzles(force = false) {
    if (!force && this.allPuzzlesLoaded) {
      return;
    }

    this.allPuzzlesLoading.set(true);
    this.allPuzzlesError.set(null);

    this.puzzlesService
      .getAll()
      .pipe(finalize(() => this.allPuzzlesLoading.set(false)))
      .subscribe({
        next: (list) => {
          this.allPuzzles.set(list);
          this.allPuzzlesLoaded = true;
        },
        error: (err) => {
          const errorText =
            typeof err?.error === 'string' ? err.error : err?.message ?? 'Failed to load puzzles.';
          this.allPuzzlesError.set(errorText);
          this.allPuzzles.set([]);
          this.allPuzzlesLoaded = false;
        },
      });
  }

  private loadCreatorPuzzles(creatorId: string, force = false) {
    if (!creatorId) {
      this.creatorPuzzles.set([]);
      this.creatorPuzzlesLoadedFor = null;
      return;
    }

    if (!force && this.creatorPuzzlesLoadedFor === creatorId && this.creatorPuzzles().length > 0) {
      return;
    }

    this.puzzlesLoading.set(true);
    this.puzzlesError.set(null);

    this.puzzlesService
      .getByCreatorId(creatorId)
      .pipe(finalize(() => this.puzzlesLoading.set(false)))
      .subscribe({
        next: (list) => {
          this.creatorPuzzles.set(list);
          this.creatorPuzzlesLoadedFor = creatorId;
          const current = this.auth.user();
          if (current?.id && current?.userName) {
            this.setCreatorName(current.id, current.userName);
          }
        },
        error: (err) => {
          const errorText =
            typeof err?.error === 'string' ? err.error : err?.message ?? 'Failed to load puzzles.';
          this.puzzlesError.set(errorText);
          this.creatorPuzzles.set([]);
          this.creatorPuzzlesLoadedFor = null;
        },
      });
  }

  private setCreatorName(id: string, name: string) {
    if (!id || !name) {
      return;
    }
    this.creatorNames.update((current) => {
      if (current[id] === name) {
        return current;
      }
      return { ...current, [id]: name };
    });
  }

  createUser() {
    const name = this.newUserName.trim();
    const password = this.newUserPassword.trim();
    const role = this.newUserRole;
    this.resetAdminMessages();
    if (!name || !password || !role) {
      this.userFormError.set('Name, password, and role are required.');
      return;
    }
    if (!this.usernamePolicy.test(name)) {
      this.userFormError.set('Username can only contain letters and digits without spaces.');
      return;
    }
    if (!this.passwordPolicy.test(password)) {
      this.userFormError.set(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.'
      );
      return;
    }

    this.creatingUser.set(true);
    this.auth.register({ name, password, role }).subscribe({
      next: () => {
        this.userFormMessage.set('User created successfully.');
        this.newUserName = '';
        this.newUserPassword = '';
        this.newUserRole = 'GAME_CREATOR';
        this.adminPasswordVisible.set(false);
        this.refreshUsers();
        this.creatingUser.set(false);
      },
      error: (err) => {
        const errorText =
          typeof err?.error === 'string' ? err.error : err?.message ?? 'Failed to create user.';
        this.userFormError.set(errorText);
        this.creatingUser.set(false);
      },
    });
  }

  protected deleteUser(user: AdminUserSummary) {
    if (!user?.id || this.deletingUserId()) {
      return;
    }

    const confirmed = window.confirm(`Delete user "${user.userName}"?`);
    if (!confirmed) {
      return;
    }

    this.userFormError.set(null);
    this.userFormMessage.set(null);
    this.deletingUserId.set(user.id);
    this.auth.deleteUser(user.id).subscribe({
      next: () => {
        this.userFormMessage.set(`User ${user.userName} deleted.`);
        this.refreshUsers();
        this.deletingUserId.set(null);
      },
      error: (err: unknown) => {
        let errorText = 'Failed to delete user.';
        const anyErr = err as any;
        if (typeof anyErr === 'string') {
          errorText = anyErr;
        } else if (anyErr?.error && typeof anyErr.error === 'string') {
          errorText = anyErr.error;
        } else if (anyErr?.message && typeof anyErr.message === 'string') {
          errorText = anyErr.message;
        }
        this.userFormError.set(errorText);
        this.deletingUserId.set(null);
      },
    });
  }

  addPuzzle() {
    const nameEmpty = !this.newPuzzleName || !this.newPuzzleName.trim();
    const solutionEmpty = !this.newPuzzleSolution || !this.newPuzzleSolution.trim();
    this.newPuzzleNameError = nameEmpty;
    this.newPuzzleSolutionError = solutionEmpty;
    if (nameEmpty || solutionEmpty) return;

    this.puzzleFormError.set(null);
    this.puzzleFormMessage.set(null);
    this.puzzlesError.set(null);

    const creatorId = this.auth.user()?.id ?? '';
    if (!creatorId) {
      this.puzzleFormError.set('Unable to determine creator. Please sign in again.');
      return;
    }

    const imageMissing = !this.newPuzzleImageFile;
    this.newPuzzleImageError = imageMissing;
    if (imageMissing) {
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.newPuzzleName.trim());
    formData.append('Solution', this.newPuzzleSolution.trim());
    formData.append('DifficultyLevel', this.newPuzzleDifficulty);
    formData.append('CreatorId', creatorId);
    if (this.newPuzzleImageFile) {
      formData.append('Image', this.newPuzzleImageFile, this.newPuzzleImageFile.name);
    }

    this.creatingPuzzle.set(true);
    this.puzzlesService
      .create(formData)
      .pipe(
        switchMap(() =>
          this.puzzlesService.getByCreatorId(creatorId).pipe(
            catchError(() => {
              this.puzzlesError.set(
                'Puzzle created but failed to refresh the list. Please reload the page.'
              );
              return of(null);
            })
          )
        ),
        finalize(() => this.creatingPuzzle.set(false))
      )
      .subscribe({
        next: (list) => {
          if (list) {
            this.creatorPuzzles.set(list);
            this.creatorPuzzlesLoadedFor = creatorId;
            this.puzzlesError.set(null);
          }
          this.loadAllPuzzles(true);
          this.puzzleFormMessage.set('Puzzle created successfully.');
          this.newPuzzleName = '';
          this.newPuzzleSolution = '';
          this.newPuzzleDifficulty = 'easy';
          this.newPuzzleImageFile = null;
          this.newPuzzleImageError = false;
          this.newPuzzleNameError = false;
          this.newPuzzleSolutionError = false;
          const el = document.getElementById('puzzle-image-input') as HTMLInputElement | null;
          if (el) el.value = '';
        },
        error: (err) => {
          const errorText =
            typeof err?.error === 'string' ? err.error : err?.message ?? 'Failed to create puzzle.';
          this.puzzleFormError.set(errorText);
        },
      });
  }

  onImageSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;
    this.resetPuzzleMessages();
    this.newPuzzleImageFile = file;
    if (file) {
      this.newPuzzleImageError = false;
    }
  }

  getUserCount() {
    return this.users().length;
  }
}

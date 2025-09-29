import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PuzzleItem, PuzzlesService } from '../../core/services/puzzles.service';
import { UserItem, UsersService } from '../../core/services/users.service';

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
            <a
              *ngIf="isAdmin()"
              class="nav-link"
              routerLink="/dashboard"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              >Users</a
            >
            <a class="nav-link" routerLink="/settings" routerLinkActive="active">Settings</a>
          </nav>
        </aside>

        <section class="dash-content">
          <!-- Delete confirmation modal (fixed overlay) -->
          <div
            class="confirm-overlay"
            *ngIf="deleteTarget"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
          >
            <div class="confirm-card card" id="confirm-dialog">
              <h4 id="confirm-title">Confirm delete</h4>
              <p id="confirm-desc">Are you sure you want to delete "{{ deleteTarget.name }}"?</p>
              <div class="confirm-actions">
                <button id="delete-cancel-btn" class="btn ghost" (click)="cancelDelete()">
                  Cancel
                </button>
                <button class="btn" (click)="doDelete()">Delete</button>
              </div>
            </div>
          </div>
          <div class="hero card">
            <div class="hero-left">
              <h2>Hello {{ auth.user()?.userName }},</h2>
              <p class="muted">Quick actions and overview of your workspace</p>
            </div>
            <div class="hero-right">
              <div class="stats">
                <div class="stat">
                  <div class="stat-number">{{ getPuzzleCount() }}</div>
                  <div class="stat-label">Total Puzzles</div>
                </div>
                <div class="stat">
                  <div class="stat-number">{{ getMyPuzzles() }}</div>
                  <div class="stat-label">My Puzzles</div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="isAdmin()" class="admin-panel">
            <div class="card">
              <div class="card-header">
                <h3>Manage Users</h3>
                <div>
                  <input placeholder="Name" [(ngModel)]="newUserName" />
                  <input placeholder="Email" [(ngModel)]="newUserEmail" />
                  <button class="btn" (click)="createUser()">New User</button>
                </div>
              </div>
              <ul class="user-list">
                <li *ngFor="let u of users()">
                  <div class="user-info">
                    <div class="uname">{{ u.userName }}</div>
                    <div class="uemail">{{ u.email }}</div>
                  </div>
                  <div class="user-actions">
                    <button class="btn ghost" (click)="removeUser(u.id)">Delete</button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div *ngIf="!isAdmin()" class="creator-panel">
            <div class="card">
              <h3>Create a New Puzzle</h3>
              <div class="form-row">
                <input
                  placeholder="Name"
                  [(ngModel)]="newPuzzleName"
                  (ngModelChange)="newPuzzleNameError = false"
                  required
                />
                <select [(ngModel)]="newPuzzleDifficulty">
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
              <textarea
                placeholder="Solution"
                [(ngModel)]="newPuzzleSolution"
                (ngModelChange)="newPuzzleSolutionError = false"
                required
              ></textarea>
              <div *ngIf="newPuzzleSolutionError" class="field-error">Solution is required</div>

              <!-- Create button placed under the Solution field (green success style) -->
              <div style="margin-top:.75rem">
                <button class="btn success" (click)="addPuzzle()">Create</button>
              </div>
            </div>
          </div>

          <!-- Puzzle list visible to all authenticated users -->
          <div class="card">
            <h3>Your Puzzles</h3>
            <ul class="puzzle-list">
              <li *ngFor="let p of puzzles()">
                <!-- Display mode -->
                <div *ngIf="editId !== p.id" class="p-item">
                  <div class="p-meta">
                    <div class="p-name">{{ p.name }}</div>
                    <div class="p-diff muted">{{ p.difficultyLevel }}</div>
                  </div>
                  <div class="p-actions">
                    <button class="btn" *ngIf="auth.canManagePuzzles()" (click)="startEdit(p)">
                      Edit
                    </button>
                    <button
                      class="btn ghost"
                      *ngIf="auth.canManagePuzzles()"
                      (click)="confirmDelete(p)"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <!-- Edit mode: shows inline form bound to editDraft -->
                <div
                  *ngIf="editId === p.id"
                  class="card"
                  style="padding:0.75rem;margin-bottom:0.5rem;"
                >
                  <div style="display:flex;gap:.5rem;align-items:center;">
                    <input [(ngModel)]="editDraft!.name" placeholder="Name" />
                    <select [(ngModel)]="editDraft!.difficultyLevel">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div style="margin-top:.5rem">
                    <textarea [(ngModel)]="editDraft!.solution" placeholder="Solution"></textarea>
                  </div>
                  <div style="display:flex;gap:.5rem;justify-content:flex-end;margin-top:.5rem">
                    <button class="btn ghost" (click)="cancelEdit()">Cancel</button>
                    <button class="btn" (click)="saveEdit()">Save</button>
                  </div>
                </div>

                <!-- Image preview (only shown in display mode) -->
                <div *ngIf="p.image && editId !== p.id" style="margin-top:8px;">
                  <img
                    [src]="p.image"
                    alt="puzzle image"
                    style="max-width:160px;border-radius:6px;border:1px solid var(--surface-panel-border)"
                  />
                </div>
              </li>
            </ul>
          </div>
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
        border: 1px solid var(--surface-panel-border);
        color: var(--text-primary);
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
export class DashboardComponent implements OnDestroy {
  protected auth = inject(AuthService);
  protected usersService = inject(UsersService);
  protected puzzlesService = inject(PuzzlesService);

  protected users = signal<UserItem[]>([]);
  protected puzzles = signal<PuzzleItem[]>([]);

  protected newUserName = '';
  protected newUserEmail = '';

  // new puzzle fields matching backend model
  protected newPuzzleName = '';
  protected newPuzzleSolution = '';
  protected newPuzzleDifficulty: 'hard' | 'medium' | 'easy' = 'easy';
  protected newPuzzleImageBase64?: string;
  protected newPuzzleNameError = false;
  protected newPuzzleSolutionError = false;

  constructor() {
    // load initial data for authenticated users
    effect(() => {
      if (this.auth.isAuthenticated()) {
        // load users and puzzles when authenticated
        this.usersService.list().subscribe((list) => this.users.set(list));
        this.refreshPuzzles();
      }
    });
    // global Escape handler to close modal
    window.addEventListener('keydown', this.deleteKeyHandler);
  }

  // Edit/delete state
  protected editId: string | null = null;
  protected editDraft: Partial<PuzzleItem> | null = null;
  protected deleteTarget: PuzzleItem | null = null;

  // handler reference so we can remove listener
  private deleteKeyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.deleteTarget) {
      this.cancelDelete();
    }
  };

  isAdmin() {
    return this.auth.isAdmin();
  }

  // removed refreshUsers() - use usersService.list() directly where needed

  createUser() {
    if (!this.newUserName) return;
    this.usersService
      .create({ userName: this.newUserName, email: this.newUserEmail })
      .subscribe(() => {
        this.usersService.list().subscribe((list) => this.users.set(list));
        this.newUserName = '';
        this.newUserEmail = '';
      });
  }

  removeUser(id: string) {
    this.usersService
      .remove(id)
      .subscribe(() => this.usersService.list().subscribe((list) => this.users.set(list)));
  }

  refreshPuzzles() {
    this.puzzlesService.list().subscribe((p) => this.puzzles.set(p));
  }

  // (create puzzle) use addPuzzle() directly

  addPuzzle() {
    // validate required fields
    const nameEmpty = !this.newPuzzleName || !this.newPuzzleName.trim();
    const solutionEmpty = !this.newPuzzleSolution || !this.newPuzzleSolution.trim();
    this.newPuzzleNameError = nameEmpty;
    this.newPuzzleSolutionError = solutionEmpty;
    if (nameEmpty || solutionEmpty) return;
    const payload: Partial<PuzzleItem> = {
      name: this.newPuzzleName.trim(),
      solution: this.newPuzzleSolution.trim(),
      difficultyLevel: this.newPuzzleDifficulty,
      image: this.newPuzzleImageBase64,
      createdBy: this.auth.user()?.userName,
    };

    this.puzzlesService.create(payload).subscribe(() => {
      this.refreshPuzzles();
      this.newPuzzleName = '';
      this.newPuzzleSolution = '';
      this.newPuzzleDifficulty = 'easy';
      this.newPuzzleImageBase64 = undefined;
      const el = document.getElementById('puzzle-image-input') as HTMLInputElement | null;
      if (el) el.value = '';
    });
  }

  startEdit(p: PuzzleItem) {
    this.editId = p.id;
    this.editDraft = { ...p };
  }

  saveEdit() {
    if (!this.editId || !this.editDraft) return;
    this.puzzlesService.update(this.editId, this.editDraft!).subscribe(() => {
      this.refreshPuzzles();
      this.cancelEdit();
    });
  }

  cancelEdit() {
    this.editId = null;
    this.editDraft = null;
  }

  confirmDelete(p: PuzzleItem) {
    this.deleteTarget = p;
    // focus cancel button for accessibility
    setTimeout(() => {
      const el = document.getElementById('delete-cancel-btn') as HTMLButtonElement | null;
      if (el) el.focus();
    }, 0);
  }

  cancelDelete() {
    this.deleteTarget = null;
  }

  doDelete() {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.puzzlesService.remove(id).subscribe(() => {
      this.deleteTarget = null;
      this.refreshPuzzles();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.deleteKeyHandler);
  }

  onImageSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | ArrayBuffer | null;
      if (typeof result === 'string') this.newPuzzleImageBase64 = result;
    };
    reader.readAsDataURL(file);
  }

  getUserCount() {
    return this.users()?.length ?? 0;
  }

  getMyPuzzles() {
    const me = this.auth.user()?.userName;
    if (!me) return 0;
    return this.puzzles()?.filter((p) => p.createdBy === me).length ?? 0;
  }

  getPuzzleCount() {
    return this.puzzles()?.length ?? 0;
  }
}

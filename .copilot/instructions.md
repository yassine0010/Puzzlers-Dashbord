# GitHub Copilot Instructions for IEEE Puzzlers Admin Dashboard

## Current Phase: Static Frontend (Pre-API Integration)

The application is **currently a static / UI-first build**. There is **no live backend connectivity yet**. All authentication, puzzle data, users, analytics, and settings views must be implemented using **pure client-side mocks** until the API layer is introduced later.

### Rules During Static Phase

1. Do **NOT** add real HTTP calls (`HttpClient`) unless explicitly requested for scaffolding with clear TODO comments.
2. Services should expose signals / computed state fed by **in-memory mock data**. Keep data creation isolated in a `mocks/` sub-folder or inside the service with a clear `// MOCK DATA (replace when API wired)` banner.
3. All side‑effects (create/update/delete) should: update local signal state, simulate latency with `timer` / `delay` (optional), and return an observable or promise shaped like future API responses.
4. Authentication is **mocked**. Do not implement token storage, refresh flows, or interceptors yet (unless scaffolded and disabled behind a flag).
5. Every place where a real API would be called must include a `// TODO(API)` marker plus the intended endpoint (reference to CLAUDE.md endpoints where applicable).
6. Avoid premature abstractions (no generic repository layers yet). Keep it pragmatic but structured for an easy swap to real HTTP later.
7. Keep UI states (loading / empty / error / success) fully implemented now so backend wiring is plug‑and‑play.

### Transition Guidance (When Backend Arrives)

Prepare code so the later change is mechanical:

- Replace mock arrays with `http.get` calls inside dedicated methods.
- Wrap each method return type already in `Observable<DomainType>` or signals fed by an internal subject.
- Centralize endpoint path segments as constants in a future `api-endpoints.ts`.
- Interceptors (auth, error) will be enabled only after backend handshake.

### Temporary Icon / Emoji Note

Design mandate forbids emojis in final production UI. Current sidebar uses emojis strictly as **temporary placeholders**. When introducing the real icon system (SVG sprite or Angular Material icons), replace them and remove this note. Do **NOT** add additional emojis elsewhere.

### Commit Message Convention for Static Phase Work

Use prefixes:

- `ui:` UI component / layout work
- `mock:` adding or adjusting mock data/service logic
- `route:` routing / guards adjustments
- `doc:` updates to instruction or design guidance

Example: `mock: add in-memory puzzle CRUD service with latency simulation`

---

## Project Overview

This is an Angular 20.3.0 admin dashboard for managing IEEE programming puzzlers competitions. Always reference the `CLAUDE.md` file for comprehensive development guidelines.

## Brand Guidelines

### Color Palette

- **Blue Dark** (`#0469DD`):
- **Blue Cyan** (`#029FD3`):
- **White** (`#FFFFFF`):
- **Mild Green** (`#77BD43`):
- **Deep Green** (`#158D45`):

### Logo Usage

- Use `/assets/blanc.png` for dark backgrounds (header/navigation)
- Use `/assets/Groupe 170.png` for light backgrounds (login, cards)
- Always maintain aspect ratio and minimum size requirements

## Professional Design Mandate (Enterprise Standard)

All generated or modified UI MUST adhere to an extremely professional, company-grade design language:

### Core Principles

- Minimal, purposeful, production-focused. No playful or experimental visuals.
- No emojis, decorative novelty icons, or gratuitous gradients.
- Strict reuse of established tokens (color, spacing, typography). No ad-hoc hex values.
- Accessibility (WCAG AA contrast) is mandatory—never remove focus outlines for keyboard users.
- Restrained motion; avoid unnecessary animation.

### Layout & Spacing

- 4px base scale (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64).
- Section separation 32–40px; internal element grouping 8–16px.
- Left-align data-heavy content; avoid center alignment except for empty states/auth forms.

### Typography

- Single approved font stack. Defined scale only (e.g. 28 / 22 / 18 / 16 / 14 / 12).
- No ad-hoc font sizes, weights, or letter-spacing tweaks unless tokenized.
- Use truncation + tooltip for overflow in dense tables.

### Components

- Buttons: clear hierarchy (primary, secondary, subtle, destructive). Max 2 emphasis levels per view.
- Forms: left-aligned labels, inline validation, consistent vertical rhythm.
- Tables: subtle row separators; avoid heavy borders; optional zebra only for dense data.
- Dialogs: single primary action; minimal cognitive load.

### Prohibited Elements

- Emojis, skeuomorphism, glassmorphism, neumorphism, animated backgrounds.
- Over-rounded pills everywhere (keep radii 2–6px unless explicitly tokenized otherwise).
- Random color splashes or inconsistent iconography.

### Acceptance Checklist (every PR / AI change)

1. Consistent with tokens?
2. Contrast + focus preserved?
3. Reduces (or not increasing) visual noise?
4. Reuses existing patterns?
5. Avoids prohibited elements?

Any “No” requires revision before merge.

> Principle: Clarity, restraint, and reliability over flair.

> Static Phase Reminder: Even while mocking, maintain production‑grade structure (naming, separation, accessibility) so no large refactor is required later.

## Key Context for Code Generation

### API Integration

- Base URL: Use environment configuration
- Authentication: JWT Bearer tokens with interceptors
- Roles: PUZZLE_CREATOR, Admin
- File uploads: Handle puzzle images (multipart/form-data)

### Angular Modern Practices

- Use standalone components (default in Angular 20.3.0)
- Use signals for state management: `signal()`, `computed()`, `effect()`
- Use new control flow: `@if`, `@for`, `@switch`
- Use `inject()` function instead of constructor injection
- Use `input()` and `output()` for component communication

### Code Patterns

When generating components, always include:

1. Proper TypeScript interfaces for data models
2. Loading and error states using signals
3. Reactive forms with validation
4. Proper error handling and user feedback
5. Consistent naming conventions (kebab-case files, PascalCase classes)

### Common Tasks

- CRUD operations for puzzles only
- File upload handling for puzzle images
- Role-based route guards for puzzle management
- Responsive table components with pagination
- Form validation for puzzle creation and editing

## Example Code Patterns

### Service Pattern

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PuzzleService {
  private http = inject(HttpClient);
  private puzzles = signal<Puzzle[]>([]);

  readonly puzzles$ = this.puzzles.asReadonly();
}
```

### Component Pattern

```typescript
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-puzzle-list',
  imports: [CommonModule],
  template: `
    @if (loading()) {
    <div>Loading...</div>
    } @else if (error()) {
    <div class="error">{{ error() }}</div>
    } @else { @for (puzzle of puzzles(); track puzzle.id) {
    <div>{{ puzzle.name }}</div>
    } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuzzleListComponent {
  private puzzleService = inject(PuzzleService);

  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected puzzles = computed(() => this.puzzleService.puzzles$());
}
```

Always follow the patterns and guidelines outlined in the main CLAUDE.md file.

# GitHub Copilot Instructions for IEEE Puzzlers Admin Dashboard

## Project Overview

This is an Angular 20.3.0 admin dashboard for managing IEEE programming puzzlers competitions. Always reference the `CLAUDE.md` file for comprehensive development guidelines.

## Key Context for Code Generation

### API Integration

- Base URL: Use environment configuration
- Authentication: JWT Bearer tokens with interceptors
- Roles: PUZZLE_CREATOR, GAME_CREATOR, Admin
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

- CRUD operations for puzzles and tournaments
- File upload handling for puzzle images
- Real-time updates using SignalR
- Role-based route guards
- Responsive table components with pagination

## Example Code Patterns

### Service Pattern

```typescript
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class PuzzleService {
  private http = inject(HttpClient);
  private puzzles = signal<Puzzle[]>([]);

  readonly puzzles$ = this.puzzles.asReadonly();
}
```

### Component Pattern

```typescript
import { Component, signal, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-puzzle-list",
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

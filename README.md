# IEEE Puzzlers Admin Dashboard

An Angular 20.3.0 admin dashboard for managing IEEE programming puzzlers competitions, tournaments, and user performance tracking.

## 🚀 Features

- **Puzzle Management**: Create, edit, view, and delete programming puzzles with images
- **Image Upload**: Support for puzzle image uploads and management
- **Difficulty Levels**: Easy, medium, and hard puzzle categorization
- **Search & Filter**: Find puzzles by name, difficulty, or creator
- **Role-based Access**: PUZZLE_CREATOR and Admin roles
- **Responsive Design**: Mobile-friendly admin interface

## 🛠️ Tech Stack

- **Frontend**: Angular 20.3.0 with Standalone Components
- **Backend**: .NET 8 Web API
- **Database**: SQL Server with Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **File Upload**: Multipart form data for images
- **UI Framework**: Angular Material (recommended)

## 🤖 AI Development Setup

This project is optimized for AI-assisted development with GitHub Copilot:

### Context Files

- **`CLAUDE.md`**: Comprehensive development guidelines and project context
- **`.copilot/instructions.md`**: GitHub Copilot specific instructions
- **`.vscode/`**: VS Code workspace settings for optimal AI integration

### Recommended Extensions

- GitHub Copilot & GitHub Copilot Chat
- Angular Language Service
- TypeScript + Angular Extensions
- Prettier Code Formatter

### AI Best Practices

1. Always reference `CLAUDE.md` for project-specific guidelines
2. Use modern Angular patterns (signals, standalone components, new control flow)
3. Follow TypeScript strict mode and proper typing
4. Implement proper error handling and loading states
5. Use role-based guards for protected routes

## 📁 Project Structure

```
src/
├── app/
│   ├── core/          # Singleton services, guards, interceptors
│   ├── shared/        # Reusable components, pipes, directives
│   ├── features/      # Feature modules (puzzles, tournaments, users)
│   ├── layout/        # Layout components
│   └── pages/         # Page-level components
├── assets/            # Static assets
├── environments/      # Environment configurations
└── styles/           # Global styles and themes
```

## 🏃‍♂️ Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Puzzlers-Dashbord/DashBordPuzzlers
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```typescript
   // src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'https://localhost:7000/api',
     signalRUrl: 'https://localhost:7000/communicationHub',
   };
   ```

4. **Start development server**

   ```bash
   npm start
   ```

5. **Access the application**
   - Development: `http://localhost:4200`
   - API Documentation: `https://localhost:7000/swagger`

## 🔐 Authentication

The dashboard uses JWT Bearer authentication with role-based authorization:

- **PUZZLE_CREATOR**: Can create, edit, and manage their own puzzles
- **Admin**: Full administrative access to all puzzles and user management

## 📋 API Integration

Key endpoints from the .NET backend:

```typescript
// Puzzles CRUD
GET / api / Puzzels / GetAllPuzzles; // List all puzzles with pagination
POST / api / Puzzels / CreatePuzzle; // PUZZLE_CREATOR - Create puzzle
GET / api / Puzzels / GetPuzzleById / { id }; // Get specific puzzle
PUT / api / Puzzels / UpdatePuzzle / { id }; // PUZZLE_CREATOR - Update puzzle
DELETE / api / Puzzels / DeletePuzzle / { id }; // Admin - Delete puzzle

// Authentication
POST / api / Account / Login; // User login
POST / api / Account / Register; // User registration
POST / api / Account / RefreshToken; // Token refresh
```

## 🎯 Development Guidelines

### Modern Angular Patterns

```typescript
// Use signals for state management
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-puzzle-list',
  imports: [CommonModule],
  template: `
    @if (loading()) {
    <div>Loading...</div>
    } @else { @for (puzzle of puzzles(); track puzzle.id) {
    <div>{{ puzzle.name }}</div>
    } }
  `,
})
export class PuzzleListComponent {
  protected puzzles = signal<Puzzle[]>([]);
  protected loading = signal(false);
}
```

### Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class PuzzleService {
  private http = inject(HttpClient);

  getPuzzles() {
    return this.http.get<Puzzle[]>('/api/Puzzels/GetAllPuzzles');
  }
}
```

## 🤝 Contributing

1. Follow the guidelines in `CLAUDE.md`
2. Use the recommended VS Code extensions
3. Write tests for new features
4. Ensure responsive design
5. Follow the established naming conventions

## 📖 Additional Resources

- [Angular 20.3.0 Documentation](https://angular.dev)
- [Angular AI Development Guide](https://angular.dev/ai)
- [GitHub Copilot Best Practices](https://docs.github.com/copilot)
- [SignalR with Angular](https://docs.microsoft.com/signalr/javascript/client)

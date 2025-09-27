You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

# AI Development Instructions for IEEE Puzzlers Admin Dashboard

This file provides context and guidelines for AI assistants when working on this Angular admin dashboard project. Reference this file when making code changes or suggestions.

## Project Context

This is an **IEEE Puzzlers Admin Dashboard** built with Angular 20.3.0 that manages:

### Backend API (.NET 8 with SignalR)

- **Base URL**: Configure in environment files (never hardcode)
- **Authentication**: JWT Bearer tokens with role-based authorization
- **Real-time**: SignalR hub for live tournament updates
- **Roles**: `PUZZLE_CREATOR`, `GAME_CREATOR`, `Admin`

### Core Entities

- **Puzzles**: Name, Image (byte[]), Solution, DifficultyLevel (easy/medium/hard)
- **Tournaments**: Name, Password, PuzzleCount, associated puzzles
- **Users**: ASP.NET Identity with custom Performance tracking
- **Performance**: User tournament participation and solved count tracking
- **Tournament_Puzzle**: Many-to-many relationship between tournaments and puzzles

### Key API Endpoints

- `GET /api/Puzzels/GetAllPuzzles` - List all puzzles
- `POST /api/Puzzels/CreatePuzzle` - Create new puzzle (PUZZLE_CREATOR)
- `GET /api/Tournament/GetAllTournaments` - List tournaments
- `POST /api/Tournament/CreateTournament` - Create tournament (GAME_CREATOR)
- `POST /api/TournamentPuzzle/AddPuzzleToTournament` - Assign puzzle to tournament
- **SignalR Hub**: `/communicationHub` for real-time tournament updates

## TypeScript Best Practices

- Use strict type checking with `"strict": true` in tsconfig.json
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Create interfaces for API response models matching backend DTOs
- Use discriminated unions for form states and loading states
- Leverage template literal types for API endpoints

## Angular Best Practices

- Always use standalone components over NgModules (Angular 20.3.0 default)
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management with proper signal composition
- Implement lazy loading for feature routes and admin sections
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images (logos, icons, static assets)
- `NgOptimizedImage` does not work for dynamic images (puzzle images from API)
- Use Angular Material or PrimeNG for consistent UI components
- Implement proper error boundaries with error handling service
- Use Angular's built-in `AsyncPipe` for observable subscriptions

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- DO NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility (PuzzleService, TournamentService, AuthService)
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
- Implement proper HTTP interceptors for JWT tokens and error handling
- Create dedicated services for SignalR connection management
- Use RxJS operators for state management and data transformation
- Implement proper retry logic for API calls
- Cache frequently accessed data using signals or RxJS operators

## Admin Dashboard Specific Guidelines

### Authentication & Authorization

- Implement role-based guards for PUZZLE_CREATOR and GAME_CREATOR routes
- Store JWT tokens securely (HttpOnly cookies recommended over localStorage)
- Implement automatic token refresh mechanisms
- Handle 401/403 responses gracefully with proper user feedback

### Data Management

- Create TypeScript interfaces matching backend DTOs:
  ```typescript
  interface PuzzleDto {
    name: string;
    image: File;
    solution: string;
    difficultyLevel: "easy" | "medium" | "hard";
  }
  ```
- Handle file uploads for puzzle images with proper validation
- Implement proper loading states for CRUD operations
- Use optimistic updates for better UX where appropriate

### Real-time Features

- Implement SignalR connection service for tournament updates
- Handle connection states (connecting, connected, reconnecting, disconnected)
- Provide fallback mechanisms when real-time connection fails
- Use signals to manage real-time state updates

### UI/UX Patterns

- Implement confirmation dialogs for destructive actions
- Use skeleton loaders during data fetching
- Provide proper feedback for form submissions
- Implement proper pagination for large datasets
- Use virtual scrolling for large lists when necessary

## Project Structure & File Organization

Follow this recommended folder structure for the admin dashboard:

```
src/
├── app/
│   ├── core/                 # Singleton services, guards, interceptors
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── shared/               # Reusable components, pipes, directives
│   │   ├── components/
│   │   ├── pipes/
│   │   └── models/
│   ├── features/             # Feature-specific modules
│   │   ├── puzzles/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── models/
│   │   ├── tournaments/
│   │   └── users/
│   ├── layout/               # Layout components (header, sidebar, etc.)
│   └── pages/                # Page-level components
├── assets/                   # Static assets
├── environments/             # Environment configurations
└── styles/                   # Global styles, themes
```

### Naming Conventions

- Files: kebab-case (`puzzle-list.component.ts`)
- Classes/Interfaces: PascalCase (`PuzzleListComponent`, `PuzzleDto`)
- Properties/Methods: camelCase (`puzzleList`, `createPuzzle()`)
- Constants: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- Component selectors: app-prefix (`app-puzzle-list`)

## AI Development Guidelines

### Code Generation Best Practices

- Always generate code that follows the above Angular best practices
- When creating new components, always use standalone architecture
- Generate tests alongside new components and services
- Use modern Angular APIs (signals, new control flow, inject function)
- Create proper TypeScript interfaces for all API interactions
- Implement proper error handling and loading states
- Follow consistent naming conventions (kebab-case for files, PascalCase for classes)

### Admin Dashboard Code Generation

- Generate CRUD components following consistent patterns
- Create reusable form components for puzzle/tournament creation
- Implement proper validation with Angular Reactive Forms
- Generate table components with sorting, filtering, and pagination
- Create modal/dialog components for confirmations and forms
- Implement responsive design patterns for mobile compatibility

### Security & API Keys

- Never put API keys in `environments.ts` files that ship to the client
- Store backend API URLs in environment files
- Use Angular HTTP interceptors for authentication headers
- Implement proper CSRF protection where needed
- Keep all sensitive credentials in environment variables or secrets managers
- Use Angular guards for route protection based on user roles

### Error Handling & Resilience

- Design applications to handle non-deterministic AI responses
- Implement graceful degradation when external services are unavailable
- Use "human in the loop" strategies for critical decisions
- Provide meaningful fallbacks for AI features
- Handle API errors gracefully with proper user feedback
- Implement retry mechanisms for transient failures
- Use loading states and error boundaries consistently
- Provide offline functionality where possible

### Admin Dashboard Error Handling

- Handle file upload errors with proper user feedback
- Implement form validation with clear error messages
- Handle SignalR connection failures gracefully
- Provide fallback UI when real-time features are unavailable
- Log errors appropriately for debugging (avoid logging sensitive data)
- Implement proper 404 handling for missing resources

### Tool Calling & Agentic Workflows

- Use function calling APIs to expand beyond simple chat interfaces
- Remain in control of which functions are exposed to AI models
- Implement proper validation before executing AI-requested function calls
- Consider AI-powered features for:
  - Auto-generating puzzle difficulty suggestions
  - Smart tournament bracket generation
  - Performance analytics and insights
  - Content moderation for user-submitted puzzles

## GitHub Copilot Optimization

### Context Files

- This `CLAUDE.md` file provides comprehensive project context
- `.copilot/instructions.md` contains specific GitHub Copilot guidance
- Reference both files when using Copilot Chat for complex tasks

### Best Practices for AI-Assisted Development

- Use descriptive comments to guide Copilot suggestions
- Break complex features into smaller, focused functions
- Leverage Copilot for boilerplate code generation (components, services, interfaces)
- Always review and test AI-generated code for security and correctness
- Use Copilot Chat for architectural decisions and code reviews

### Prompt Engineering Tips

- Be specific about Angular version (20.3.0) and standalone architecture
- Mention specific libraries (Angular Material, RxJS, SignalR)
- Include role-based authorization requirements in prompts
- Specify responsive design and accessibility requirements
- Request TypeScript interfaces alongside component generation

### VS Code Integration

- Use the recommended extensions for optimal development experience
- Enable format-on-save with Prettier for consistent code style
- Use TypeScript strict mode for better IntelliSense and error detection
- Leverage Angular Language Service for template assistance

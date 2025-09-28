import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { delay, of, tap } from 'rxjs';
import { AuthState, LoginRequest, UserInfo, UserRole } from '../../shared/models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  // Static mock user data for puzzle management
  private readonly MOCK_USER: UserInfo & { roles: UserRole[] } = {
    id: '1',
    email: 'admin@puzzlers.com',
    userName: 'admin',
    roles: ['Admin', 'PUZZLE_CREATOR'],
  };

  private readonly MOCK_TOKEN = 'mock-jwt-token-12345';

  // Reactive state using signals
  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    roles: [],
    loading: false,
    error: null,
  });

  // Public readonly signals
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly user = computed(() => this.authState().user);
  readonly roles = computed(() => this.authState().roles);
  readonly loading = computed(() => this.authState().loading);
  readonly error = computed(() => this.authState().error);

  constructor() {
    // Initialize with static auth state - not authenticated by default
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    // For static mode, start with unauthenticated state
    // Users will need to "login" to see authenticated content
    this.authState.update((state) => ({
      ...state,
      isAuthenticated: false,
      user: null,
      token: null,
      roles: [],
    }));
  }

  login(credentials: LoginRequest) {
    this.authState.update((state) => ({ ...state, loading: true, error: null }));

    // Simulate API call with delay
    return of(null).pipe(
      delay(1000), // Simulate network delay
      tap(() => {
        // For static mode, accept any credentials
        if (credentials.userName && credentials.password) {
          // Update state with mock user
          this.authState.update((state) => ({
            ...state,
            isAuthenticated: true,
            user: this.MOCK_USER,
            token: this.MOCK_TOKEN,
            roles: this.MOCK_USER.roles,
            loading: false,
            error: null,
          }));

          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        } else {
          // Show error for empty credentials
          this.authState.update((state) => ({
            ...state,
            loading: false,
            error: 'Please enter valid username and password',
          }));
        }
      })
    );
  }

  logout(): void {
    this.authState.update((state) => ({
      ...state,
      isAuthenticated: false,
      user: null,
      token: null,
      roles: [],
      error: null,
    }));
    this.router.navigate(['/login']);
  }

  // Helper methods for role checking - puzzle management only
  hasRole(role: UserRole): boolean {
    return this.roles().includes(role);
  }

  canCreatePuzzles(): boolean {
    return this.hasRole('PUZZLE_CREATOR') || this.hasRole('Admin');
  }

  canManagePuzzles(): boolean {
    return this.hasRole('PUZZLE_CREATOR') || this.hasRole('Admin');
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  getAuthToken(): string | null {
    return this.authState().token;
  }

  clearError(): void {
    this.authState.update((state) => ({ ...state, error: null }));
  }
}

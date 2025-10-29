import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  AdminUserSummary,
  AuthState,
  LoginRequest,
  RegisterRequest,
  UserInfo,
  UserRole,
} from '../../shared/models/auth.models';

// Backend API base (use your API host)
const API_BASE = 'http://172.20.10.3:5000';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  private readonly STORAGE_KEY = 'puzzlers_auth_token';

  // Reactive state using signals
  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    roles: [],
    loading: false,
    error: null,
  });

  // Public readonly signals (call them as functions)
  readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  readonly user = computed(() => this.authState().user);
  readonly roles = computed(() => this.authState().roles);
  readonly loading = computed(() => this.authState().loading);
  readonly error = computed(() => this.authState().error);

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    // Avoid accessing localStorage during server-side rendering
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.authState.set({
        isAuthenticated: false,
        user: null,
        token: null,
        roles: [],
        loading: false,
        error: null,
      });
      return;
    }

    const token = localStorage.getItem(this.STORAGE_KEY);
    if (token) {
      const parsed = this.parseJwt(token);
      const user = this.buildUserFromClaims(parsed);
      const roles = this.extractRolesFromClaims(parsed);
      this.authState.set({
        isAuthenticated: true,
        user,
        token,
        roles,
        loading: false,
        error: null,
      });
    } else {
      this.authState.set({
        isAuthenticated: false,
        user: null,
        token: null,
        roles: [],
        loading: false,
        error: null,
      });
    }
  }

  // Perform login against backend. Backend expects { Name, Password }
  login(credentials: LoginRequest) {
    this.authState.update((s) => ({ ...s, loading: true, error: null }));

    const payload = {
      Name: credentials.userName,
      Password: credentials.password,
    };

    return this.http
      .post<{ token: string; expiration: string }>(`${API_BASE}/api/Account/Login`, payload)
      .pipe(
        tap((res) => {
          if (!res || !res.token) {
            this.authState.update((s) => ({
              ...s,
              loading: false,
              error: 'Invalid response from server',
            }));
            return;
          }

          const token = res.token;
          // Persist token
          try {
            localStorage.setItem(this.STORAGE_KEY, token);
          } catch (e) {
            // ignore storage errors
          }

          const claims = this.parseJwt(token);
          const user = this.buildUserFromClaims(claims);
          const roles = this.extractRolesFromClaims(claims);

          this.authState.update((s) => ({
            ...s,
            isAuthenticated: true,
            user,
            token,
            roles,
            loading: false,
            error: null,
          }));

          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        }),
        catchError((err) => {
          const msg = err?.error ?? err?.message ?? 'Login failed';
          this.authState.update((s) => ({
            ...s,
            loading: false,
            error: typeof msg === 'string' ? msg : 'Login failed',
          }));
          return of(null);
        })
      );
  }

  logout(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
    this.authState.set({
      isAuthenticated: false,
      user: null,
      token: null,
      roles: [],
      loading: false,
      error: null,
    });
    this.router.navigate(['/login']);
  }

  canCreatePuzzles(): boolean {
    return this.hasRole('PUZZLE_CREATOR');
  }

  canManagePuzzles(): boolean {
    return this.hasRole('PUZZLE_CREATOR');
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  getAuthToken(): string | null {
    return this.authState().token;
  }

  // Admin API helpers
  register(payload: RegisterRequest) {
    const body = {
      Name: payload.name,
      Password: payload.password,
      Role: payload.role,
    };
    return this.http.post(`${API_BASE}/api/Account/Register`, body, {
      responseType: 'text',
    });
  }

  getAllUsers() {
    return this.http
      .get<Array<AdminUserSummary & { Roles?: string[] }>>(`${API_BASE}/api/Account/GetAllUsers`)
      .pipe(
        map((list) =>
          (list ?? []).map((user) => ({
            id: user.id,
            userName: user.userName,
            roles: (user.roles ?? user.Roles ?? []).filter(Boolean),
          }))
        )
      );
  }

  deleteUser(id: string) {
    return this.http.delete(`${API_BASE}/api/Account/DeleteUser/${encodeURIComponent(id)}`, {
      responseType: 'text',
    });
  }

  clearError(): void {
    this.authState.update((s) => ({ ...s, error: null }));
  }

  // ------------------ Helpers ------------------
  // JWT parsing helper (no external lib). Returns decoded payload or {} on failure.
  private parseJwt(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return {};
      const payload = parts[1];
      // Add padding if needed
      const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
      let decoded = '';
      if (typeof (globalThis as any).atob === 'function') {
        decoded = (globalThis as any).atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (typeof Buffer !== 'undefined') {
        decoded = Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString(
          'utf8'
        );
      } else {
        return {};
      }
      return JSON.parse(decoded);
    } catch (e) {
      return {};
    }
  }

  private buildUserFromClaims(claims: any): UserInfo | null {
    if (!claims) return null;
    const id =
      claims['nameid'] ||
      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const userName =
      claims['unique_name'] ||
      claims['name'] ||
      claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    const email = claims['email'] || `${userName ?? 'user'}@example.com`;
    if (!userName) return null;
    return { id: id ?? '', email, userName } as UserInfo;
  }

  private extractRolesFromClaims(claims: any): UserRole[] {
    if (!claims) return [];
    const roleClaim =
      claims['role'] ||
      claims['roles'] ||
      claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!roleClaim) return [];
    // Normalize to array and uppercase strings for case-insensitive checks
    const rolesArr = Array.isArray(roleClaim) ? roleClaim.slice() : [roleClaim];
    const normalized = rolesArr
      .map((r) => (typeof r === 'string' ? r.trim() : ''))
      .filter(Boolean)
      .map((r) => r.toUpperCase());

    // Map known uppercase role names to canonical UserRole values used in the app
    const mapped = normalized
      .map((u) => {
        if (u === 'ADMIN') return 'Admin' as UserRole;
        if (u === 'PUZZLE_CREATOR') return 'PUZZLE_CREATOR' as UserRole;
        return null;
      })
      .filter((v): v is UserRole => v !== null);

    return mapped;
  }

  // Utility: case-insensitive role check (accepts either role name or canonical role)
  hasRole(role: UserRole): boolean {
    if (!role) return false;
    const want = role.toString().toUpperCase();
    return this.roles().some((r) => r.toString().toUpperCase() === want);
  }
}

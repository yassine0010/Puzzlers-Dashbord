// User authentication interfaces matching the backend API
export interface LoginRequest {
  // Username-based authentication (was email previously)
  userName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
  roles: string[];
}

export interface UserInfo {
  id: string;
  email: string;
  userName: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;
}

// API response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  message: string;
  success: boolean;
  errors?: string[];
}

// User roles from backend - simplified for puzzle CRUD only
export type UserRole = 'PUZZLE_CREATOR' | 'Admin';

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  roles: UserRole[];
  loading: boolean;
  error: string | null;
}

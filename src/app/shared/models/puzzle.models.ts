// Puzzle management interfaces for simple CRUD operations
export interface Puzzle {
  id: string;
  name: string;
  description?: string;
  solution: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreatePuzzleRequest {
  name: string;
  description?: string;
  solution: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  image?: File;
}

export interface UpdatePuzzleRequest {
  id: string;
  name: string;
  description?: string;
  solution: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  image?: File;
}

// API response wrapper for puzzles
export interface PuzzleApiResponse<T = any> {
  data?: T;
  message: string;
  success: boolean;
  errors?: string[];
}

// Pagination support for puzzle lists
export interface PuzzleListResponse {
  puzzles: Puzzle[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PuzzleItem {
  id: string;
  // Matches backend: Name, Image (bytes/base64), Solution, DifficultyLevel
  name: string;
  image?: string; // storing base64 string for demo
  solution: string;
  difficultyLevel: 'hard' | 'medium' | 'easy';
  createdBy?: string;
}

@Injectable({ providedIn: 'root' })
export class PuzzlesService {
  private puzzles: PuzzleItem[] = [];

  list() {
    return of(this.puzzles.slice());
  }

  create(payload: Partial<PuzzleItem>) {
    const item: PuzzleItem = {
      id: String(Date.now()),
      name: payload.name ?? 'Untitled',
      image: payload.image,
      solution: payload.solution ?? '',
      difficultyLevel: (payload.difficultyLevel as PuzzleItem['difficultyLevel']) ?? 'easy',
      createdBy: payload.createdBy ?? 'unknown',
    };
    this.puzzles.push(item);
    return of(item);
  }

  update(id: string, payload: Partial<PuzzleItem>): Observable<PuzzleItem | null> {
    const idx = this.puzzles.findIndex((p) => p.id === id);
    if (idx === -1) return of(null);
    const existing = this.puzzles[idx];
    const updated: PuzzleItem = {
      ...existing,
      ...payload,
      id: existing.id,
    };
    this.puzzles[idx] = updated;
    return of(updated);
  }

  remove(id: string) {
    this.puzzles = this.puzzles.filter((p) => p.id !== id);
    return of(true);
  }
}

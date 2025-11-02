import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PuzzleItem {
  id: string;
  name: string;
  image?: string;
  solution: string;
  difficultyLevel: 'hard' | 'medium' | 'easy';
  createdBy?: string;
  creatorName?: string;
}

@Injectable({ providedIn: 'root' })
export class PuzzlesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Puzzels`;

  getAll(): Observable<PuzzleItem[]> {
    return this.http
      .get<BackendPuzzle[] | string>(`${this.baseUrl}/GetAllPuzzles`)
      .pipe(map((response) => this.normalizeList(response)));
  }

  getByCreatorId(creatorId: string): Observable<PuzzleItem[]> {
    if (!creatorId) {
      return of([]);
    }
    return this.http
      .get<BackendPuzzle[] | string>(
        `${this.baseUrl}/GetPuzzelsByCreatorId/${encodeURIComponent(creatorId)}`
      )
      .pipe(map((response) => this.normalizeList(response)));
  }

  create(formData: FormData): Observable<string> {
    return this.http.post(`${this.baseUrl}/CreatePuzzle`, formData, {
      responseType: 'text',
    });
  }

  delete(id: string | number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/DeletePuzzle/${encodeURIComponent(id)}`, {
      responseType: 'text',
    });
  }

  private normalizeList(response: BackendPuzzle[] | string | null | undefined): PuzzleItem[] {
    if (!response) return [];
    if (typeof response === 'string') return [];
    return response.map((entry) => this.normalizePuzzle(entry));
  }

  private normalizePuzzle(entry: BackendPuzzle): PuzzleItem {
    const raw: any = entry ?? {};
    
    // Debug: log the raw entry to see what the backend is sending
    console.log('Backend puzzle data:', raw);
    
    const id = raw.id ?? raw.Id ?? '';
    const name = raw.name ?? raw.Name ?? '';
    const solution = raw.solution ?? raw.Solution ?? '';
    const difficulty = (raw.difficultyLevel ?? raw.DifficultyLevel ?? 'easy')
      .toString()
      .toLowerCase();
    const creatorId = raw.creatorId ?? raw.CreatorId ?? undefined;
    const creatorName =
      raw.creatorName ?? raw.CreatorName ?? raw.userName ?? raw.UserName ?? undefined;
    const imageSource = this.toImageDataUrl(raw.image ?? raw.Image);
    
    console.log('Extracted creator info - ID:', creatorId, 'Name:', creatorName);

    return {
      id: String(id),
      name,
      solution,
      difficultyLevel: this.ensureDifficulty(difficulty),
      image: imageSource,
      createdBy: creatorId,
      creatorName: creatorName,
    };
  }

  private toImageDataUrl(image?: string | null): string | undefined {
    if (!image) return undefined;
    if (image.startsWith('data:')) return image;
    return `data:image/png;base64,${image}`;
  }

  private ensureDifficulty(value: string): PuzzleItem['difficultyLevel'] {
    if (value === 'hard' || value === 'medium' || value === 'easy') {
      return value;
    }
    return 'easy';
  }
}

type BackendPuzzle = {
  id?: number | string;
  Id?: number | string;
  name?: string;
  Name?: string;
  image?: string;
  Image?: string;
  solution?: string;
  Solution?: string;
  difficultyLevel?: string;
  DifficultyLevel?: string;
  creatorId?: string;
  CreatorId?: string;
  creatorName?: string;
  CreatorName?: string;
  userName?: string;
  UserName?: string;
};

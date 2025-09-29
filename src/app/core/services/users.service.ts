import { Injectable } from '@angular/core';
import { of } from 'rxjs';

export interface UserItem {
  id: string;
  userName: string;
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  // In-memory user list for admin CRUD demo
  private users: UserItem[] = [
    { id: '1', userName: 'admin', email: 'admin@puzzlers.com', roles: ['Admin'] },
    { id: '2', userName: 'jdoe', email: 'jdoe@example.com', roles: ['PUZZLE_CREATOR'] },
  ];

  list() {
    return of(this.users.slice());
  }

  get(id: string) {
    return of(this.users.find((u) => u.id === id) ?? null);
  }

  create(payload: Partial<UserItem>) {
    const id = String(Date.now());
    const user: UserItem = {
      id,
      userName: payload.userName ?? 'new',
      email: payload.email ?? '',
      roles: payload.roles ?? [],
    };
    this.users.push(user);
    return of(user);
  }

  update(id: string, patch: Partial<UserItem>) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return of(null);
    this.users[idx] = { ...this.users[idx], ...patch };
    return of(this.users[idx]);
  }

  remove(id: string) {
    this.users = this.users.filter((u) => u.id !== id);
    return of(true);
  }
}

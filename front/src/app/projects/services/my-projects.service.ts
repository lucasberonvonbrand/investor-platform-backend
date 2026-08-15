import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

export interface IMyProjectStudent { id: number; name: string; }

export interface IMyProjectApi {
  id: number;
  name: string;
  description: string;
  budgetGoal: number;
  currentGoal: number;
  status: string;
  startDate: string;
  estimatedEndDate: string;
  endDate: string | null;
  ownerId?: number;
  ownerName?: string;
  tagName?: string;
  students?: IMyProjectStudent[];
}

export interface IMyProject {
  id: number;
  title: string;
  summary: string | null;
  status: string | null;
  lastUpdated: string | null;
  fundingGoal: number | null;
  fundingRaised: number | null;
  owner?: string | null;
  ownerId?: number;
  category?: string | null;
  university?: string | null;
  students?: IMyProjectStudent[] | null;
  startDate?: string | null;
  estimatedEndDate?: string | null;
}

function adapt(p: IMyProjectApi): IMyProject {
  return {
    id: p.id,
    title: p.name,
    summary: p.description ?? null,
    status: p.status ?? null,
    lastUpdated: p.startDate ?? null,
    fundingGoal: p.budgetGoal ?? null,
    fundingRaised: p.currentGoal ?? null,
    owner: p.ownerName ?? null,
    ownerId: p.ownerId,
    category: p.tagName ?? null,
    university: null,
    students: p.students ?? null,
    startDate: p.startDate ?? null,
    estimatedEndDate: p.estimatedEndDate ?? null,
  };
}

@Injectable({ providedIn: 'root' })
export class MyProjectsService {
  private http = inject(HttpClient);

  private getUserId(): number | null {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return null;
      const u = JSON.parse(raw) as { id: number };
      return typeof u?.id === 'number' ? u.id : null;
    } catch {
      return null;
    }
  }

  getMine(): Observable<IMyProject[]> {
    const id = this.getUserId();
    if (!id) return of([]);

    const url = `/api/projects/by-owner/${id}`;
    return this.http.get<IMyProjectApi[]>(url).pipe(
      map(list => (list ?? []).map(adapt)),
      catchError(err => {
        if (err.status === 404) return of([]);
        throw err;
      })
    );
  }

  getByOwner(ownerId: number): Observable<IMyProject[]> {
    return this.http.get<IMyProjectApi[]>(`/api/projects/by-owner/${ownerId}`).pipe(
      map(list => (list ?? []).map(adapt)),
      catchError(err => {
        if (err.status === 404) return of([]);
        throw err;
      })
    );
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type MyProjectStatus = 'PENDING_FUNDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface CreateMyProjectDto {
  name: string;
  description: string;
  budgetGoal: number;
  status: MyProjectStatus | string;
  startDate: string;         // YYYY-MM-DD
  estimatedEndDate: string;  // YYYY-MM-DD
  ownerId: number;
  studentIds: number[];
}

export interface IMyProject {
  id: number;
  title: string;
  summary?: string | null;
  category?: string | null;
  status?: 'IDEA'|'IN_PROGRESS'|'MVP'|'FUNDING'|'COMPLETED'|string;
  university?: string | null;
  owner?: string | null;
  // opcionales crudos
  ownerId?: number | null;
  studentIds?: number[] | null;

  lastUpdated?: string | null;
  fundingGoal?: number | null;
  fundingRaised?: number | null;
}

interface MyProjectApi {
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
  studentIds?: number[];
}

function adaptMyProject(p: MyProjectApi): IMyProject {
  return {
    id: p.id,
    title: p.name,
    summary: p.description,
    status: p.status,
    fundingGoal: p.budgetGoal,
    fundingRaised: p.currentGoal,
    lastUpdated: p.startDate || null,
    category: '—',
    university: null,
    owner: null,
    ownerId: p.ownerId ?? null,
    studentIds: p.studentIds ?? null,
  };
}

@Injectable({ providedIn: 'root' })
export class MyProjectsService {
  private http = inject(HttpClient);
  private api = '/api/projects/mine';

  /** Trae mis proyectos (server-side, según usuario autenticado) */
  getMine(options?: { includeAssigned?: boolean }): Observable<IMyProject[]> {
    let params = new HttpParams();
    if (options?.includeAssigned) params = params.set('includeAssigned', 'true');

    return this.http
      .get<MyProjectApi[]>(this.api, { params })
      .pipe(map(list => (list ?? []).map(adaptMyProject)));
  }

  /** Crear (si tu backend lo permite contra /projects) */
  create(dto: CreateMyProjectDto): Observable<{ id: number } & MyProjectApi> {
    // si querés que cree SIEMPRE como “mío”, lo usual es POST a /api/projects (no /mine)
    return this.http.post<{ id: number } & MyProjectApi>('/api/projects', dto);
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface IProject {
  id: number;
  title: string;
  summary?: string | null;
  category?: string | null;
  status?: 'IDEA' | 'IN_PROGRESS' | 'MVP' | 'FUNDING' | 'COMPLETED' | string;
  university?: string | null;
  owner?: string | null;
  tags?: string[] | null;
  lastUpdated?: string | null;
  fundingGoal?: number | null;
  fundingRaised?: number | null;
}

// === DTO que viene del backend ===
interface ProjectApi {
  id: number;
  name: string;
  description: string;
  budgetGoal: number;
  currentGoal: number;
  status: string;
  startDate: string;          // ISO
  estimatedEndDate: string;   // ISO
  endDate: string | null;     // ISO | null
}

// Adaptador de API -> UI
function adapt(p: ProjectApi): IProject {
  return {
    id: p.id,
    title: p.name,
    summary: p.description,
    status: p.status,                     // ej: "PENDING_FUNDING" (lo mostramos tal cual)
    fundingGoal: p.budgetGoal,
    fundingRaised: p.currentGoal,
    lastUpdated: p.startDate || null,     // usamos startDate para la timeline
    category: '—',                        // no viene en la API: default
    university: null,
    owner: null,
    tags: null
  };
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private http = inject(HttpClient);
  // Si ya tenés baseURL por proxy, dejá /api:
  private api = '/api/projects';
  // Si preferís environment:
  // private api = `${environment.apiBase}/projects`;

  getAll(): Observable<IProject[]> {
    return this.http.get<ProjectApi[]>(this.api).pipe(
      map(list => (list ?? []).map(adapt))
    );
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Si ya tenés IMyProject definido en tu servicio actual, podés importar eso:
// import type { IMyProject } from './my-projects.service';

// Versión mínima local (si preferís no importar):
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
  tags?: string[];
  students?: Array<{ id: number; name: string }>|null;
}

export interface IContract {
  id: number;
  projectId: number;
  title: string;
  amount: number;
  status: 'borrador' | 'activo' | 'finalizado' | 'cancelado';
  currency?: 'USD' | 'ARS' | 'CNY';
  profit1Year?: number;
  profit2Years?: number;
  profit3Years?: number;
  startDate?: string | null;
  endDate?: string | null;
  clauses?: string | null;
}

export interface IChatMessage {
  id: number;
  projectId: number;
  authorId: number;
  authorName: string;
  message: string;
  createdAt: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class ProjectsMasterService {
  private http = inject(HttpClient);

  // ======== API REAL (descomentá y ajustá) ========
  // getProjectById(id: number): Observable<IMyProject> {
  //   return this.http.get<IMyProject>(`/api/projects/${id}`);
  // }
  getContracts(projectId: number): Observable<IContract[]> {
    return this.http.get<IContract[]>(`/api/contracts/by-project/${projectId}`);
  }
  upsertContract(dto: Partial<IContract> & { projectId: number; createdByInvestorId?: number }): Observable<IContract> {
    return dto.id
      ? this.http.put<IContract>(`/api/contracts/${dto.id}`, dto)
      : this.http.post<IContract>(`/api/contracts`, dto);
  }

  signContract(contractId: number, studentId: number): Observable<IContract> {
    return this.http.post<IContract>(`/api/contracts/${contractId}/sign`, { studentId });
  }

  cancelContractByInvestor(contractId: number, investorId: number): Observable<IContract> {
    return this.http.post<IContract>(`/api/contracts/${contractId}/cancel-by-investor`, { investorId });
  }

  // getChat(projectId: number): Observable<IChatMessage[]> { // MOCK
  //   return this.http.get<IChatMessage[]>(`/api/projects/${projectId}/chat`);
  // }
  // sendMessage(msg: Omit<IChatMessage, 'id' | 'createdAt'>): Observable<IChatMessage> {
  //   return this.http.post<IChatMessage>(`/api/projects/${msg.projectId}/chat`, msg);
  // }
  // updateProject(id: number, patch: Partial<IMyProject>): Observable<IMyProject> {
  //   return this.http.patch<IMyProject>(`/api/projects/${id}`, patch);
  // }

  // ======== MOCKS (para que puedas probar ya mismo) ========
  private _projects: IMyProject[] = [
    {
      id: 101,
      title: 'Detector de Fugas IoT',
      summary: 'Sensado de redes y dashboard',
      status: 'activo',
      lastUpdated: new Date().toISOString(),
      fundingGoal: 10000,
      fundingRaised: 4200,
      owner: 'Equipo IoT',
      ownerId: 1, // ID de ejemplo para el dueño
      category: 'IoT',
      university: 'UNLAM',
      tags: ['iot', 'sensors'],
      students: [{ id: 15, name: 'Sofía' }, { id: 16, name: 'Lucas' }],
    },
  ];

  private _contracts: IContract[] = [
    { id: 1, projectId: 101, title: 'Contrato Semilla', amount: 2500, status: 'activo', startDate: '2025-09-01', endDate: null },
    { id: 2, projectId: 101, title: 'Acuerdo NDA', amount: 0, status: 'finalizado', startDate: '2025-08-15', endDate: '2025-09-15' },
  ];

  private _chat$ = new BehaviorSubject<IChatMessage[]>([
    { id: 1, projectId: 101, authorId: 4,  authorName: 'Inversor Juan', message: '¿Cómo viene el hito 1?', createdAt: new Date().toISOString() },
    { id: 2, projectId: 101, authorId: 15, authorName: 'Estudiante Sofía', message: 'Hoy subo el informe.', createdAt: new Date().toISOString() },
  ]);

  getProjectById(id: number): Observable<IMyProject> {
    const p = this._projects.find(x => x.id === id);
    return of(p as IMyProject).pipe(delay(200));
  }

  // getContracts(projectId: number): Observable<IContract[]> {
  //   return of(this._contracts.filter(c => c.projectId === projectId)).pipe(delay(200));
  // }

  // upsertContract(dto: Partial<IContract> & { projectId: number }): Observable<IContract> {
  //   if (dto.id) {
  //     const idx = this._contracts.findIndex(c => c.id === dto.id);
  //     if (idx >= 0) this._contracts[idx] = { ...this._contracts[idx], ...dto } as IContract;
  //     return of(this._contracts[idx]).pipe(delay(150));
  //   } else {
  //     const newId = Math.max(0, ...this._contracts.map(c => c.id)) + 1;
  //     const created: IContract = {
  //       id: newId,
  //       title: dto.title || 'Sin título',
  //       amount: dto.amount ?? 0,
  //       status: (dto.status as IContract['status']) || 'borrador',
  //       startDate: dto.startDate ?? null,
  //       endDate: dto.endDate ?? null,
  //       projectId: dto.projectId,
  //     };
  //     this._contracts.unshift(created);
  //     return of(created).pipe(delay(150));
  //   }
  // }

  getChat(projectId: number): Observable<IChatMessage[]> {
    return this._chat$.pipe(map(list => list.filter(m => m.projectId === projectId)));
  }

  sendMessage(msg: Omit<IChatMessage, 'id' | 'createdAt'>): Observable<IChatMessage> {
    const created: IChatMessage = {
      ...msg,
      id: Math.max(0, ...this._chat$.value.map(m => m.id)) + 1,
      createdAt: new Date().toISOString(),
    };
    this._chat$.next([...this._chat$.value, created]);
    return of(created).pipe(delay(120));
  }

  updateProject(id: number, patch: Partial<IMyProject>): Observable<IMyProject> {
    const idx = this._projects.findIndex(p => p.id === id);
    if (idx >= 0) this._projects[idx] = { ...this._projects[idx], ...patch };
    return of(this._projects[idx]).pipe(delay(150));
  }
}

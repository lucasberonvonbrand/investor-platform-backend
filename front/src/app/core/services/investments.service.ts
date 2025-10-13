import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest } from 'rxjs';
import { delay, map } from 'rxjs/operators';

// Reutilizo la forma de proyecto que ya usás
export interface IMyProject {
  id: number;
  title: string;
  summary: string | null;
  status: string | null;
  lastUpdated: string | null;
  fundingGoal: number | null;
  fundingRaised: number | null;
  owner?: string | null;
  category?: string | null;
  university?: string | null;
  tags?: string[];
}

export interface IContractLite {
  id: number;
  projectId: number;
  investorId: number;
  status: 'borrador' | 'activo' | 'finalizado' | 'cancelado';
  startDate?: string | null;
  endDate?: string | null;
  amount?: number | null;
}

@Injectable({ providedIn: 'root' })
export class InvestmentsService {
  private http = inject(HttpClient);

  // ========= EP reales (ejemplo) =========
  // private getContractsByInvestor(investorId: number): Observable<IContractLite[]> {
  //   return this.http.get<IContractLite[]>(`/api/contracts?investorId=${investorId}&status=activo`);
  // }
  // private getProjectsByIds(ids: number[]): Observable<IMyProject[]> {
  //   return this.http.post<IMyProject[]>(`/api/projects/batch`, { ids });
  // }

  // ========= MOCKS para probar ya =========
  private _contracts: IContractLite[] = [
    { id: 40, projectId: 101, investorId: 5, status: 'activo', startDate: '2025-08-01' },
    { id: 41, projectId: 202, investorId: 5, status: 'activo', startDate: '2025-08-20' },
    { id: 42, projectId: 303, investorId: 8, status: 'activo', startDate: '2025-05-15' },
  ];
  private _projects: IMyProject[] = [
    { id: 101, title: 'Detector de Fugas IoT', summary: 'Sensado y dashboard', status: 'IN_PROGRESS',
      lastUpdated: new Date().toISOString(), fundingGoal: 10000, fundingRaised: 4200, category: 'IoT', university: 'UNLAM', tags: ['iot','sensors'] },
    { id: 202, title: 'Plataforma EdTech', summary: 'Clases en vivo', status: 'IN_PROGRESS',
      lastUpdated: new Date().toISOString(), fundingGoal: 15000, fundingRaised: 10000, category: 'EdTech', university: 'UNLAM', tags: ['angular','node'] },
    { id: 303, title: 'App Salud Móvil', summary: 'Seguimiento de pacientes', status: 'COMPLETED',
      lastUpdated: '2025-06-01', fundingGoal: 20000, fundingRaised: 20000, category: 'Salud', university: 'UNLaM', tags: ['mobile'] },
  ];

  private _getContractsByInvestorMock(investorId: number): Observable<IContractLite[]> {
    return of(this._contracts.filter(c => c.investorId === investorId && c.status === 'activo')).pipe(delay(150));
    // si querés incluir borradores/en curso: ajustá el filtro de status arriba
  }
  private _getProjectsByIdsMock(ids: number[]): Observable<IMyProject[]> {
    return of(this._projects.filter(p => ids.includes(p.id))).pipe(delay(120));
  }

  /** Retorna proyectos donde el inversor actual tiene contrato "activo" */
  getMyInvestedProjects(): Observable<IMyProject[]> {
    const user = this.getCurrentUser();
    const investorId = user?.id;
    if (!investorId) return of([]);

    // Con EP reales usarías this.getContractsByInvestor(...) + this.getProjectsByIds(...)
    return this._getContractsByInvestorMock(investorId).pipe(
      map(contracts => Array.from(new Set(contracts.map(c => c.projectId)))),
      // traer proyectos
      // switchMap(ids => this.getProjectsByIds(ids))
      // mock:
      // @ts-ignore
      map(ids => ids as number[]),
      // @ts-ignore
      (ids$) => combineLatest([ids$]).pipe(
        // unwrap
        map(([ids]) => ids),
        // @ts-ignore
        switchMap((ids: number[]) => this._getProjectsByIdsMock(ids))
      )
    );
  }

  private getCurrentUser(): { id: number; roles: string[]; username?: string } | null {
    try {
      const raw = localStorage.getItem('pp_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

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
  currency?: 'USD' | 'ARS' | 'CNY';
  amount?: number | null;
}

@Injectable({ providedIn: 'root' })
export class InvestmentsService {
  private http = inject(HttpClient);

  // --- Endpoints Reales ---
  private getContractsByInvestor(investorId: number): Observable<IContractLite[]> {
    // Llama al endpoint que trae los contratos de un inversor
    return this.http.get<IContractLite[]>(`/api/contracts/by-investor/${investorId}`);
  }

  // Nuevo método para el dashboard
  getAllContracts(): Observable<IContractLite[]> {
    return this.http.get<IContractLite[]>(`/api/contracts`);
  }

  /** Retorna proyectos donde el inversor actual tiene contrato "activo" */
  getMyInvestedProjects(): Observable<IMyProject[]> {
    const user = this.getCurrentUser();
    const investorId = user?.id;
    if (!investorId) {
      return of([]); // Si no hay ID de inversor, no se puede hacer la llamada
    }

    // 1. Obtener los contratos del inversor
    return this.getContractsByInvestor(investorId).pipe(
      // 2. Extraer los proyectos de esos contratos
      map(contracts => (contracts ?? []).map((c: any) => c.project)),
      // 3. Adaptar la estructura de datos a la que espera el componente (IMyProject)
      map(projects => (projects ?? []).map((p: any) => ({
        id: p.id,
        title: p.name,
        summary: p.description,
        status: p.status,
        lastUpdated: p.startDate,
        fundingGoal: p.budgetGoal,
        fundingRaised: p.currentGoal,
        owner: p.ownerName,
        category: '—', // El backend no provee categoría aquí
        university: null,
        students: p.students,
      } as IMyProject)))
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

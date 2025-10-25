import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest, switchMap, map } from 'rxjs';

import { ProjectsMasterService } from './projects-master.service';
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

export interface IInvestment {
  idInvestment: number;
  status: string;
  amount: number;
  currency: string;
  createdAt: string;
  confirmedAt: string | null;
  projectId: number;
}

export interface IInvestedProject extends IInvestment {
  project: IMyProject;
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
  private projectsMasterSvc = inject(ProjectsMasterService);

  // --- Endpoints Reales ---
  private getInvestmentsByInvestor(investorId: number): Observable<IInvestment[]> {
    // Llama al endpoint que trae las inversiones de un inversor
    return this.http.get<IInvestment[]>(`/api/investments/by-investor/${investorId}`);
  }

  // Nuevo método para el dashboard
  getAllContracts(): Observable<IContractLite[]> {
    return this.http.get<IContractLite[]>(`/api/contracts`);
  }

  /** Retorna proyectos donde el inversor actual tiene contrato "activo" */
  getMyInvestedProjects(): Observable<IInvestedProject[]> {
    const user = this.getCurrentUser();
    const investorId = user?.id;
    if (!investorId) {
      return of([]); // Si no hay ID de inversor, no se puede hacer la llamada
    }

    // 1. Obtener las inversiones
    return this.getInvestmentsByInvestor(investorId).pipe(
      // 2. Si no hay inversiones, devolver un array vacío
      switchMap(investments => {
        if (!investments || investments.length === 0) {
          return of([]);
        }
        // 3. Crear un array de observables, cada uno buscando los detalles de un proyecto
        const projectObservables = investments.map(inv =>
          this.projectsMasterSvc.getProjectById(inv.projectId).pipe(
            // 4. Combinar los datos de la inversión con los del proyecto
            map(project => ({ ...inv, project }))
          )
        );
        // 5. Esperar a que todos los observables se completen
        return combineLatest(projectObservables);
      })
    );
  }

  getInvestmentById(investmentId: number): Observable<IInvestedProject | null> {
    // Este método asume que el inversor actual es el que consulta.
    // Podríamos añadir una validación de seguridad en el backend.
    return this.http.get<IInvestment>(`/api/investments/${investmentId}`).pipe(
      switchMap(investment => {
        if (!investment) return of(null);
        return this.projectsMasterSvc.getProjectById(investment.projectId).pipe(
          map(project => ({ ...investment, project }))
        );
      })
    );
  }

  private getCurrentUser(): { id: number; roles: string[]; username?: string } | null {
    try {
      const raw = localStorage.getItem('auth_user'); // Clave correcta para el usuario logueado
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

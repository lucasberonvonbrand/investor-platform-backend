import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest, switchMap, map, catchError } from 'rxjs';

import { ProjectDetailsService, IInvestment, IEarning, IContract } from '../../projects/services/project-details.service';
import { IMyProject } from '../../projects/services/my-projects.service';
import { AuthService } from '../../auth/services/auth.service';

export interface IInvestedProject extends IInvestment {
  project: IMyProject;
  earnings?: IEarning[];
  profit1Year?: number;
  profit2Years?: number;
  profit3Years?: number;
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
  private projectDetailsSvc = inject(ProjectDetailsService);
  private auth = inject(AuthService);

  private getInvestmentsByInvestor(investorId: number): Observable<IInvestment[]> {
    return this.http.get<IInvestment[]>(`/api/investments/by-investor/${investorId}`);
  }

  getAllContracts(): Observable<IContractLite[]> {
    return this.http.get<IContractLite[]>(`/api/contracts`);
  }

  getMyInvestedProjects(): Observable<IInvestedProject[]> {
    const user = this.auth.getSession();
    const investorId = user?.id;
    if (!investorId) {
      return of([]);
    }

    return this.getInvestmentsByInvestor(investorId).pipe(
      switchMap(investments => {
        if (!investments || investments.length === 0) {
          return of([]);
        }
        const projectObservables = investments.map(inv =>
          this.projectDetailsSvc.getProjectById(inv.projectId, true).pipe(
            map(project => ({ ...inv, project }))
          )
        );
        return combineLatest(projectObservables);
      })
    );
  }

  getInvestmentById(investmentId: number): Observable<IInvestedProject | null> {
    return this.http.get<IInvestment & { profit1Year?: number, profit2Years?: number, profit3Years?: number, contractId?: number }>(`/api/investments/${investmentId}`).pipe(
      switchMap(investment => {
        if (!investment) return of(null);

        const project$ = this.projectDetailsSvc.getProjectById(investment.projectId, true).pipe(
          catchError(() => of(null as any))
        );

        const contracts$ = this.projectDetailsSvc.getContracts(investment.projectId).pipe(
          catchError(() => of([] as any[]))
        );

        return combineLatest([project$, contracts$]).pipe(
          switchMap(([project, contracts]) => {
            const relatedContract = (contracts && contracts.length > 0)
              ? (contracts.find(c => c.investment?.idInvestment === investment.idInvestment || c.amount === investment.amount) || contracts[0])
              : null;

            const p1 = relatedContract?.profit1Year ?? investment.profit1Year ?? 0.12;
            const p2 = relatedContract?.profit2Years ?? investment.profit2Years ?? 0.18;
            const p3 = relatedContract?.profit3Years ?? investment.profit3Years ?? 0.25;

            if (!relatedContract) {
              return of({
                ...investment,
                project,
                earnings: [],
                profit1Year: p1,
                profit2Years: p2,
                profit3Years: p3
              } as IInvestedProject);
            }

            const earnings$ = this.projectDetailsSvc.getEarningsByContractId(relatedContract.idContract).pipe(
              catchError(() => of([] as any[]))
            );

            return earnings$.pipe(
              map(earnings => ({
                ...investment,
                project,
                earnings: earnings || [],
                profit1Year: p1,
                profit2Years: p2,
                profit3Years: p3,
              } as IInvestedProject))
            );
          })
        );
      })
    );
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { IMyProject } from './my-projects.service';

export interface IInvestment {
  idInvestment: number;
  status: 'IN_PROGRESS' | 'PENDING_CONFIRMATION' | 'RECEIVED' | 'COMPLETED' | 'NOT_RECEIVED' | 'CANCELLED' | 'PENDING_RETURN' | 'RETURNED';
  amount: number;
  currency: string;
  createdAt: string;
  confirmedAt: string | null;
  generatedById: number;
  projectId: number;
  confirmedByStudentId: number | null;
}

export interface IEarning {
  idEarning: number;
  amount: number;
  currency: string;
  createdAt: string;
  status: 'IN_PROGRESS' | 'PENDING_CONFIRMATION' | 'RECEIVED' | 'NOT_RECEIVED';
  retriesLeft?: number; 
}

export interface IContract {
  idContract: number;
  projectId: number;
  createdByInvestorId?: number; 
  title?: string; 
  textTitle?: string; 
  amount: number;
  status: 'DRAFT' | 'PARTIALLY_SIGNED' | 'SIGNED' | 'CANCELLED' | 'REFUNDED' | 'CLOSED' | 'PENDING_STUDENT_SIGNATURE';
  currency?: 'USD' | 'ARS' | 'CNY' | 'EUR';
  profit1Year?: number;
  profit2Years?: number;
  profit3Years?: number;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null; 
  investment?: IInvestment; 
  earnings?: IEarning[]; 
}

export interface ContactOwnerDTO {
  fromEmail: string;
  fromName: string;
  subject: string;
  message: string;
}

export interface IChatMessage {
  id: number;
  projectId: number;
  authorId: number;
  authorName: string;
  message: string;
  createdAt: string; 
}

function adaptProject(p: any): IMyProject {
  if (!p) return null as any;
  return {
    ...p,
    id: p.id,
    title: p.title || p.name || '',
    summary: p.summary || p.description || '',
    status: p.status || 'IN_PROGRESS',
    lastUpdated: p.lastUpdated || p.startDate || '',
    fundingGoal: p.fundingGoal ?? p.budgetGoal ?? null,
    fundingRaised: p.fundingRaised ?? p.currentGoal ?? null,
    owner: p.owner || p.ownerName || '',
    ownerId: p.ownerId || p.owner?.id || p.userId,
    category: p.category || p.tagName || '',
    university: p.university || p.universityName || '',
    students: p.students || [],
    startDate: p.startDate || null,
    estimatedEndDate: p.estimatedEndDate || null
  } as IMyProject;
}

@Injectable({ providedIn: 'root' })
export class ProjectDetailsService {
  private http = inject(HttpClient);
  
  getProjectById(id: number, includeDeleted = false): Observable<IMyProject> {
    const url = includeDeleted
      ? `/api/projects/${id}?includeDeleted=true`
      : `/api/projects/${id}`;
    return this.http.get<any>(url).pipe(map(adaptProject));
  }
  
  getContracts(projectId: number): Observable<IContract[]> {
    return this.http.get<IContract[]>(`/api/contracts/by-project/${projectId}`);
  }
  
  getContractsByInvestorAndProject(investorId: number, projectId: number): Observable<IContract[]> {
    return this.http.get<IContract[]>(`/api/contracts/investor/${investorId}/project/${projectId}`);
  }
  
  upsertContract(dto: Partial<IContract> & { projectId: number; createdByInvestorId?: number }): Observable<IContract> {
    if (dto.idContract) {
      return this.http.put<IContract>(`/api/contracts/${dto.idContract}`, dto);
    } else {
      return this.http.post<IContract>(`/api/contracts`, dto);
    }
  }

  cancelContractByInvestor(contractId: number, investorId: number): Observable<IContract> {
    return this.http.post<IContract>(`/api/contracts/${contractId}/cancel-by-investor`, { investorId });
  }

  cancelContractByStudent(contractId: number, studentId: number): Observable<IContract> {
    return this.http.put<IContract>(`/api/contracts/cancel-by-student/${contractId}`, { studentId });
  }

  contactProjectOwner(projectId: number, data: ContactOwnerDTO): Observable<void> {
    return this.http.post<void>(`/api/projects/${projectId}/contact`, data);
  }

  updateContractByInvestor(contractId: number, payload: any): Observable<IContract> {
    return this.http.put<IContract>(`/api/contracts/update-by-investor/${contractId}`, payload);
  }

  updateContractByStudent(contractId: number, payload: any): Observable<IContract> {
    return this.http.put<IContract>(`/api/contracts/update-by-student/${contractId}`, payload);
  }

  agreeToContractByInvestor(contractId: number, investorId: number): Observable<IContract> {
    return this.http.put<IContract>(`/api/contracts/agree-by-investor/${contractId}`, { investorId });
  }

  agreeToContractByStudent(contractId: number, studentId: number): Observable<IContract> {
    return this.http.put<IContract>(`/api/contracts/agree-by-student/${contractId}`, { studentId });
  }

  signContractByInvestor(contractId: number, investorId: number): Observable<IContract> {
    return this.http.put<IContract>(`/api/contracts/sign-by-investor/${contractId}`, { investorId });
  }

  signContractByStudent(contractId: number, studentId: number): Observable<IContract> {
    return this.http.put<IContract>(`/api/contracts/sign-by-student/${contractId}`, { studentId });
  }

  closeContract(contractId: number, studentId: number): Observable<IContract> {
    return this.http.put<IContract>(`/api/contracts/close/${contractId}`, { studentId });
  }

  getEarningsByContractId(contractId: number): Observable<IEarning[]> {
    return this.http.get<IEarning[]>(`/api/earnings/by-contract/${contractId}`);
  }

  confirmInvestmentPaymentSent(investmentId: number, investorId: number): Observable<IInvestment> {
    return this.http.put<IInvestment>(`/api/investments/confirm-payment-sent/${investmentId}`, { investorId });
  }

  confirmInvestmentReceipt(investmentId: number, studentId: number): Observable<IInvestment> {
    return this.http.put<IInvestment>(`/api/investments/confirm-receipt/${investmentId}`, { studentId });
  }

  markInvestmentAsNotReceived(investmentId: number, studentId: number): Observable<IInvestment> {
    return this.http.put<IInvestment>(`/api/investments/mark-not-received/${investmentId}`, { studentId });
  }

  confirmEarningPaymentSent(earningId: number, studentId: number): Observable<IEarning> {
    return this.http.put<IEarning>(`/api/earnings/confirm-payment-sent/${earningId}`, { studentId });
  }

  confirmEarningReceipt(earningId: number, investorId: number): Observable<IEarning> {
    return this.http.put<IEarning>(`/api/earnings/confirm-receipt/${earningId}`, { investorId });
  }

  markEarningAsNotReceived(earningId: number, investorId: number): Observable<IEarning> {
    return this.http.put<IEarning>(`/api/earnings/mark-not-received/${earningId}`, { investorId });
  }

  private _chat$ = new BehaviorSubject<IChatMessage[]>([
    { id: 1, projectId: 101, authorId: 4,  authorName: 'Investor John', message: 'How is milestone 1 going?', createdAt: new Date().toISOString() },
    { id: 2, projectId: 101, authorId: 15, authorName: 'Student Sofia', message: 'I will upload the report today.', createdAt: new Date().toISOString() },
  ]);

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
    return of({ id } as IMyProject).pipe(delay(150));
  }
}

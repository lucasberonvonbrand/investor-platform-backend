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
  startDate?: string | null;
  estimatedEndDate?: string | null;
  fundingGoal: number | null;
  fundingRaised: number | null;
  owner?: string | null;
  ownerId?: number;
  category?: string | null;
  university?: string | null;
  tags?: string[];
  students?: Array<{ id: number; name: string }>|null;
}

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
  retryCount?: number; // Añadido para manejar los reintentos
  remainingRetries?: number; // Nuevo campo para mostrar los reintentos restantes
}

export interface IEarning {
  idEarning: number;
  amount: number;
  currency: string;
  createdAt: string;
  status: 'IN_PROGRESS' | 'PENDING_CONFIRMATION' | 'RECEIVED' | 'NOT_RECEIVED';
  retriesLeft?: number; // Intentos restantes para el reenvío
  // ... otras propiedades que pueda tener una ganancia
}

export interface IContract {
  idContract: number;
  projectId: number;
  createdByInvestorId?: number; // Requerido para crear
  title?: string; // El título que viene del listado
  textTitle?: string; // El título que se envía al crear
  amount: number;
  status: 'DRAFT' | 'PARTIALLY_SIGNED' | 'SIGNED' | 'CANCELLED' | 'REFUNDED' | 'CLOSED' | 'PENDING_STUDENT_SIGNATURE';
  currency?: 'USD' | 'ARS' | 'CNY' | 'EUR';
  profit1Year?: number;
  profit2Years?: number;
  profit3Years?: number;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null; // Cambiado de 'clauses' a 'description' para coincidir con la API
  investment?: IInvestment; // Añadido
  earnings?: IEarning[]; // Añadido
}

export interface ContactOwnerDTO {
  fromEmail: string;
  fromName: string;
  subject: string;
  message: string;
}

export interface IStudentDetail {
  id: number;
  username: string;
  email: string;
  photoUrl?: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  university: string;
  career: string;
  degreeStatus: string;
  linkedinUrl?: string;
  description?: string;
}

export interface IChatMessage {
  id: number;
  projectId: number;
  authorId: number;
  authorName: string;
  message: string;
  createdAt: string; // ISO
}

/**
 * Adapta la respuesta de la API de un proyecto al formato que espera la UI (IMyProject).
 * @param p El objeto de proyecto de la API.
 */
function adaptProject(p: any): IMyProject {
  return {
    id: p.id,
    title: p.name, // API 'name' -> UI 'title'
    summary: p.description, // API 'description' -> UI 'summary'
    status: p.status,
    startDate: p.startDate,
    estimatedEndDate: p.estimatedEndDate,
    lastUpdated: p.startDate, // API 'startDate' -> UI 'lastUpdated'
    fundingGoal: p.budgetGoal, // API 'budgetGoal' -> UI 'fundingGoal'
    fundingRaised: p.currentGoal, // API 'currentGoal' -> UI 'fundingRaised'
    owner: p.ownerName, // API 'ownerName' -> UI 'owner'
    ownerId: p.ownerId,
    category: p.tagName, // API 'tagName' -> UI 'category'
    university: p.university, // Asumiendo que podría venir
    tags: p.tags,
    students: p.students,
  };
}

@Injectable({ providedIn: 'root' })
export class ProjectsMasterService {
  private http = inject(HttpClient);
  
  // ======== API REAL ========
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
  getStudentById(studentId: number): Observable<IStudentDetail> {
    return this.http.get<IStudentDetail>(`/api/students/${studentId}`);
  }
  getAllStudents(): Observable<{ id: number; name: string }[]> {
    // Corregido: Apuntamos al endpoint que devuelve la lista de nombres de estudiantes.
    return this.http.get<{ id: number; firstName: string; lastName: string }[]>(`/api/students/names`).pipe(
      map(students => students.map(s => ({
        id: s.id,
        // Combinamos firstName y lastName en un solo campo 'name' para el selector
        name: `${s.firstName} ${s.lastName}`.trim()
      })))
    );
  }
  upsertContract(dto: Partial<IContract> & { projectId: number; createdByInvestorId?: number }): Observable<IContract> {
    if (dto.idContract) {
      // Para actualizar, el backend podría esperar un payload diferente.
      // Por ahora, mantenemos la lógica de PUT.
      return this.http.put<IContract>(`/api/contracts/${dto.idContract}`, dto);
    } else {
      // Para crear, usamos el payload específico que necesita el backend.
      return this.http.post<IContract>(`/api/contracts`, dto);
    }
  }
  
  updateProject(id: number, payload: Partial<IMyProject>): Observable<IMyProject> {
    return this.http.put<any>(`/api/projects/${id}`, payload).pipe(map(adaptProject));
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

  /**
   * Cierra un contrato para finalizarlo y generar la ganancia.
   * @param contractId ID del contrato a cerrar.
   * @param studentId ID del estudiante que realiza la acción.
   */
  closeContract(contractId: number, studentId: number): Observable<IContract> {
    return this.http.put<IContract>(`/api/contracts/close/${contractId}`, { studentId });
  }

  // ===== Métodos para Gestión de Inversiones y Ganancias =====

  /**
   * Obtiene las ganancias asociadas a un contrato específico.
   * @param contractId ID del contrato.
   */
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
    { idContract: 1, projectId: 101, title: 'Contrato Semilla', amount: 2500, status: 'SIGNED', startDate: '2025-09-01', endDate: null },
    { idContract: 2, projectId: 101, title: 'Acuerdo NDA', amount: 0, status: 'CLOSED', startDate: '2025-08-15', endDate: '2025-09-15' },
  ];

  private _chat$ = new BehaviorSubject<IChatMessage[]>([
    { id: 1, projectId: 101, authorId: 4,  authorName: 'Inversor Juan', message: '¿Cómo viene el hito 1?', createdAt: new Date().toISOString() },
    { id: 2, projectId: 101, authorId: 15, authorName: 'Estudiante Sofía', message: 'Hoy subo el informe.', createdAt: new Date().toISOString() },
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
}

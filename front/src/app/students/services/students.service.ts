import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, switchMap, tap } from 'rxjs';

export enum DegreeStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
  ABANDONED = 'ABANDONED'
}

export enum Province {
  BUENOS_AIRES = 'BUENOS_AIRES',
  CABA = 'CABA',
  CATAMARCA = 'CATAMARCA',
  CHACO = 'CHACO',
  CHUBUT = 'CHUBUT',
  CORDOBA = 'CORDOBA',
  CORRIENTES = 'CORRIENTES',
  ENTRE_RIOS = 'ENTRE_RIOS',
  FORMOSA = 'FORMOSA',
  JUJUY = 'JUJUY',
  LA_PAMPA = 'LA_PAMPA',
  LA_RIOJA = 'LA_RIOJA',
  MENDOZA = 'MENDOZA',
  MISIONES = 'MISIONES',
  NEUQUEN = 'NEUQUEN',
  RIO_NEGRO = 'RIO_NEGRO',
  SALTA = 'SALTA',
  SAN_JUAN = 'SAN_JUAN',
  SAN_LUIS = 'SAN_LUIS',
  SANTA_CRUZ = 'SANTA_CRUZ',
  SANTA_FE = 'SANTA_FE',
  SANTIAGO_DEL_ESTERO = 'SANTIAGO_DEL_ESTERO',
  TIERRA_DEL_FUEGO = 'TIERRA_DEL_FUEGO',
  TUCUMAN = 'TUCUMAN'
}

export enum University {
  UBA = 'UBA', ITBA = 'ITBA', UADE = 'UADE', UAI = 'UAI', UCES = 'UCES', USAL = 'USAL',
  AUSTRAL = 'AUSTRAL', TORCUATO_DI_TELLA = 'TORCUATO_DI_TELLA', ISALUD = 'ISALUD',
  UNLP = 'UNLP', UNLAM = 'UNLAM', UNGS = 'UNGS', UNAHUR = 'UNAHUR', UNLu = 'UNLu', UNPAZ = 'UNPAZ', UNMdP = 'UNMdP', UNLZ = 'UNLZ',
  UNC = 'UNC', UCC = 'UCC', UTN_CORDOBA = 'UTN_CORDOBA', UNIVERSIDAD_CATOLICA_DE_CORDOBA = 'UNIVERSIDAD_CATOLICA_DE_CORDOBA',
  UNR = 'UNR', UCA_SANTA_FE = 'UCA_SANTA_FE', UTN_SANTA_FE = 'UTN_SANTA_FE',
  UNCuyo = 'UNCuyo', UCC_MENDOZA = 'UCC_MENDOZA', UTN_MENDOZA = 'UTN_MENDOZA',
  UNER = 'UNER', UCU = 'UCU',
  UNT = 'UNT', UCSE_TUCUMAN = 'UCSE_TUCUMAN', UTN_TUCUMAN = 'UTN_TUCUMAN',
  UNRN = 'UNRN', UAI_RN = 'UAI_RN',
  UNSa = 'UNSa', UCASAL = 'UCASAL',
  UNaM = 'UNaM', UCAMI = 'UCAMI',
  UNNE = 'UNNE', UCALCHA = 'UCALCHA'
}

export interface IAddress {
  street: string;
  number: number;
  city: string;
  province: Province;
  postalCode: number;
}

export interface IStudent {
  id: number;
  username: string;
  password?: string;
  email: string;
  photoUrl?: string;
  enabled: boolean;
  accountNotExpired: boolean;
  accountNotLocked: boolean;
  credentialNotExpired: boolean;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  dateOfBirth: string;
  university: University;
  career: string;
  degreeStatus: DegreeStatus;
  linkedinUrl?: string;
  description?: string;
  address?: IAddress;
}

export interface IStudentName {
  id: number;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class StudentsService {
  private http = inject(HttpClient);
  private apiUrl = '/api/students';
  private apiNamesUrl = '/api/students/names';

  constructor() {}

  loadAll(): Observable<IStudent[]> {
    return this.http.get<IStudent[]>(this.apiUrl);
  }

  getNames(q?: string): Observable<IStudentName[]> {
    const url = q != null ? `${this.apiNamesUrl}?q=${encodeURIComponent(q)}` : this.apiNamesUrl;
    return this.http.get<IStudentName[] | any>(url).pipe(
      map((list: any[]) => (list ?? []).map(s => ({
        id: s.id, firstName: s.firstName, lastName: s.lastName
      } as IStudentName))),
      catchError(err => {
        if (err.status === 400) {
          return this.http.get<IStudent[]>(this.apiUrl).pipe(
            map(list => (list ?? []).map(s => ({
              id: (s as any).id,
              firstName: (s as any).firstName ?? (s as any).nombre ?? '',
              lastName: (s as any).lastName ?? (s as any).apellido ?? ''
            })))
          );
        }
        return of([] as IStudentName[]);
      })
    );
  }

  getById(id: number | string): Observable<IStudent> {
    return this.http.get<IStudent>(`${this.apiUrl}/${id}`);
  }

  getByUsername(username: string): Observable<IStudent> {
    return this.http.get<IStudent>(`${this.apiUrl}/by-username/${username}`);
  }

  create(studentData: Partial<IStudent>): Observable<IStudent> {
    return this.http.post<IStudent>(this.apiUrl, studentData);
  }

  update(id: number | string, studentData: Partial<IStudent>): Observable<IStudent> {
    return this.http.put<IStudent>(`${this.apiUrl}/${id}`, studentData);
  }

  updateByAdmin(id: number | string, payload: any): Observable<IStudent> {
    return this.http.put<IStudent>(`${this.apiUrl}/update-by-admin/${id}`, payload);
  }

  activate(id: number | string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivate(id: number | string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

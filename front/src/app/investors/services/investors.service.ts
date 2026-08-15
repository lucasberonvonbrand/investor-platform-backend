import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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

export interface IAddress {
  street: string;
  number: number;
  city: string;
  province: Province;
  postalCode: number;
}

export interface IInvestor {
  id?: number;
  username: string;
  password?: string;
  email: string;
  cuit: string;
  contactPerson: string;
  phone: string;
  webSite?: string;
  linkedinUrl?: string;
  description?: string;
  photoUrl?: string;
  address?: IAddress;
  enabled?: boolean;
  accountNotExpired?: boolean;
  accountNotLocked?: boolean;
  credentialNotExpired?: boolean;
}

@Injectable({ providedIn: 'root' })
export class InvestorsService {
  private http = inject(HttpClient);
  private apiUrl = '/api/investors';

  private _investors = signal<IInvestor[]>([]);
  investors = this._investors.asReadonly();

  loadAll(): Observable<IInvestor[]> {
    return this.http.get<IInvestor[]>(this.apiUrl).pipe(
      tap(data => this._investors.set(data ?? []))
    );
  }

  getById(id: number): Observable<IInvestor> {
    return this.http.get<IInvestor>(`${this.apiUrl}/${id}`);
  }

  create(investorData: Partial<IInvestor>): Observable<IInvestor> {
    return this.http.post<IInvestor>(this.apiUrl, investorData).pipe(
      tap(created => this._investors.update(list => [...list, created]))
    );
  }

  update(id: number, investorData: Partial<IInvestor>): Observable<IInvestor> {
    return this.http.patch<IInvestor>(`${this.apiUrl}/${id}`, investorData).pipe(
      tap(updated => this._investors.update(list => list.map(i => i.id === id ? updated : i)))
    );
  }

  updateByAdmin(id: number, payload: any): Observable<IInvestor> {
    return this.http.put<IInvestor>(`${this.apiUrl}/update-by-admin/${id}`, payload);
  }

  activate(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this._investors.update(list => list.filter(i => i.id !== id)))
    );
  }
}

// src/app/core/services/investors.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Investor } from '../../models/investor.model';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InvestorService {
  // ✅ relativo → usa tu proxy a 72.60.11.35:8080
  private apiUrl = '/api/investors';

  private _investors = signal<Investor[]>([]);
  investors = this._investors.asReadonly();

  constructor(private http: HttpClient) {}

  loadAll(): Observable<Investor[]> {
    return this.http.get<Investor[]>(this.apiUrl).pipe(
      tap(data => this._investors.set(data ?? []))
    );
  }

  // 🔹 nuevo
  getById(id: number): Observable<Investor> {
    return this.http.get<Investor>(`${this.apiUrl}/${id}`);
  }

  create(investorData: Partial<Investor>): Observable<Investor> {
    return this.http.post<Investor>(this.apiUrl, investorData).pipe(
      tap(created => this._investors.update(list => [...list, created]))
    );
  }

  // 🔹 nuevo
  update(id: number, investorData: Partial<Investor>): Observable<Investor> {
    return this.http.put<Investor>(`${this.apiUrl}/${id}`, investorData).pipe(
      tap(updated => this._investors.update(list => list.map(i => i.id === id ? updated : i)))
    );
  }

  // 🔹 opcionales (si tu backend los tiene; si no, el componente hace fallback con update)
  activate(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/activate`, {});
  }
  deactivate(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  // 🔹 nuevo
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this._investors.update(list => list.filter(i => i.id !== id)))
    );
  }
}

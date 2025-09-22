// src/app/core/services/investors.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Investor } from '../../models/investor.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InvestorService {
  private apiUrl = 'http://localhost:8080/api/investors';

  private _investors = signal<Investor[]>([]);
  investors = this._investors.asReadonly();

  constructor(private http: HttpClient) {}

  loadAll(): Observable<Investor[]> {
    return new Observable((subscriber) => {
      this.http.get<Investor[]>(this.apiUrl).subscribe({
        next: (data) => {
          this._investors.set(data);
          subscriber.next(data);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }

  create(investorData: Partial<Investor>): Observable<Investor> {
    return new Observable((subscriber) => {
      this.http.post<Investor>(this.apiUrl, investorData).subscribe({
        next: (created) => {
          this._investors.update(list => [...list, created]);
          subscriber.next(created);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }
}

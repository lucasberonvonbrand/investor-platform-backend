import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Student } from '../../models/student.model'; 
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = 'http://localhost:8080/api/students';

  private _students = signal<Student[]>([]);
  students = this._students.asReadonly();

  constructor(private http: HttpClient) {}

  loadAll(): Observable<Student[]> {
    return new Observable((subscriber) => {
      this.http.get<Student[]>(this.apiUrl).subscribe({
        next: (data) => {
          this._students.set(data);
          subscriber.next(data);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }

  create(studentData: Partial<Student>): Observable<Student> {
    return new Observable((subscriber) => {
      this.http.post<Student>(this.apiUrl, studentData).subscribe({
        next: (createdStudent) => {
          this._students.update(list => [...list, createdStudent]);
          subscriber.next(createdStudent);
          subscriber.complete();
        },
        error: (err) => subscriber.error(err)
      });
    });
  }

  activate(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivate(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}

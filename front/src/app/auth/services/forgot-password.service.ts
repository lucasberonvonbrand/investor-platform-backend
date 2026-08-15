import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { map, catchError, throwError, Observable } from "rxjs";

interface ForgotResponse { message: string; }

const base = "/api/auth";

@Injectable({ providedIn: "root" })
export class ForgotPasswordService {
  private http = inject(HttpClient);

  requestReset(email: string): Observable<{ status: boolean; message: string }> {
    return this.http.post<ForgotResponse>(`${base}/forgot-password`, { email }).pipe(
      map(res => ({ status: true, message: res?.message ?? "We sent an email if the account exists." })),
      catchError((err: HttpErrorResponse) => {
        const msg =
          (err.error && (err.error.message || err.error?.error || err.error?.msg)) ||
          err.message || "Communication error.";
        return throwError(() => new Error(msg));
      })
    );
  }
}

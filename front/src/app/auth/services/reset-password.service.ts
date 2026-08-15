import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { map, catchError, throwError, Observable } from "rxjs";

interface ResetResponse { message: string; }

const base = "/api/auth";

@Injectable({ providedIn: "root" })
export class ResetPasswordService {
  private http = inject(HttpClient);

  reset(token: string, password: string): Observable<{ status: boolean; message: string }> {
    return this.http.post<ResetResponse>(`${base}/reset-password`, { token, password }).pipe(
      map(res => ({ status: true, message: res?.message ?? "Password reset successfully." })),
      catchError((err: HttpErrorResponse) => {
        const msg =
          (err.error && (err.error.message || err.error?.error || err.error?.msg)) ||
          err.message || "Communication error.";
        return throwError(() => new Error(msg));
      })
    );
  }
}

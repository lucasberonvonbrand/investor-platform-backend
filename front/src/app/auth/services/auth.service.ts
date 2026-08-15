import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap, map, Observable, catchError, throwError } from "rxjs";
import { mapAuthError } from "../interfaces/auth-errors";

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  message: string;
  jwt: string;
  status: boolean;
}

export interface ApiResponse {
  status: boolean;
  message?: string;
}

export interface Session {
  id: number;
  username: string;
  email: string;
  roles: string[];
  jwt: string;
  exp: number; // epoch seconds
}

const TOKEN_KEY = "auth_token";
const USER_KEY  = "auth_user";
const LOGIN_PATH = "/api/auth/login";

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);

  login(username: string, password: string): Observable<Session> {
    return this.http.post<LoginResponse>(LOGIN_PATH, { username, password }).pipe(
      map((res) => {
        if (!res?.status || !res?.jwt) throw new Error("Invalid login");
        return this.toSession(res);
      }),
      tap((s) => this.persist(s)),
      catchError((err) => throwError(() => mapAuthError(err)))
    );
  }

  requestPasswordReset(email: string) {
    return this.http.post<ApiResponse>("/api/auth/forgot", { email });
  }

  register(data: { username: string; email: string; password: string }) {
    return this.http.post<ApiResponse>("/api/auth/register", data);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get userId(): number | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const meta = JSON.parse(raw);
      return typeof meta.id === "number" ? meta.id : null;
    } catch {
      return null;
    }
  }

  getSession(): Session | null {
    try {
      const jwt = localStorage.getItem(TOKEN_KEY);
      const raw = localStorage.getItem(USER_KEY);
      if (!jwt || !raw) return null;
      const meta = JSON.parse(raw);
      return {
        id: meta.id,
        username: meta.username,
        email: meta.email ?? '',
        roles: meta.roles ?? [],
        exp: meta.exp ?? 0,
        jwt
      };
    } catch {
      return null;
    }
  }

  getUserRole(): string | null {
    const session = this.getSession();
    if (!session) return null;
    const role = session.roles?.find(r => r.startsWith('ROLE_')) ?? null;
    return role;
  }

  getUserId(): string | null {
    const session = this.getSession();
    if (!session) return null;
    return session.username || null;
  }

  get isLoggedIn(): boolean {
    const s = this.getSession();
    if (!s) return false;
    const now = Math.floor(Date.now() / 1000);
    return s.exp ? now < s.exp : true;
  }

  private toSession(res: LoginResponse): Session {
    const jwt = res.jwt;
    const payload: any = decodeJwt(jwt);

    console.log("JWT Payload:", payload);

    let rawRoles: any[] = [];
    if (Array.isArray(payload?.authorities)) rawRoles = payload.authorities;
    else if (typeof payload?.authorities === 'string') rawRoles = payload.authorities.split(',');
    else if (Array.isArray(payload?.roles)) rawRoles = payload.roles;
    else if (typeof payload?.roles === 'string') rawRoles = payload.roles.split(',');
    else if (typeof payload?.role === 'string') rawRoles = [payload.role];

    const roles = rawRoles
      .map(r => typeof r === 'string' ? r : (r.authority || r.name || r.value || JSON.stringify(r)))
      .map(x => String(x).trim())
      .filter(Boolean);

    console.log("Parsed roles:", roles);

    const exp = Number(payload?.exp ?? 0);
    const username = res.username || payload?.sub || "";
    const email = res.email || '';

    const id =
      typeof (res as any).id === "number"
        ? (res as any).id
        : Number(payload?.uid ?? payload?.user_id ?? NaN);

    if (!Number.isFinite(id)) throw new Error("Login inválido: id ausente");

    return { id, username, email, roles, jwt, exp };
  }

  private persist(s: Session) {
    localStorage.setItem(TOKEN_KEY, s.jwt);
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: s.id,
        email: s.email,
        username: s.username,
        roles: s.roles,
        exp: s.exp
      })
    );
  }
}

function decodeJwt(token: string): any {
  const parts = token?.split(".") ?? [];
  if (parts.length < 2) return null;
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(json);
}

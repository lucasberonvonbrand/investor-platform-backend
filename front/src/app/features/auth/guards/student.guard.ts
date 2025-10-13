import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';

/** Lee usuario desde localStorage (auth_user o pp_user) */
function readRoles(): string[] {
  try {
    const raw = localStorage.getItem('auth_user') ?? localStorage.getItem('pp_user');
    const u = raw ? JSON.parse(raw) as { roles?: string[] } : null;
    return Array.isArray(u?.roles) ? u!.roles! : [];
  } catch { return []; }
}

/** Bloquea incluso el lazy-load si no es estudiante */
export const studentMatch: CanMatchFn = () => {
  const router = inject(Router);
  return readRoles().includes('ROLE_STUDENT') ? true : router.parseUrl('/proyectos-panel');
};

/** Redundante pero útil si navegan por código */
export const studentGuard: CanActivateFn = () => {
  const router = inject(Router);
  return readRoles().includes('ROLE_STUDENT') ? true : router.parseUrl('/proyectos-panel');
};

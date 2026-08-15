import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';

function readUser(): { roles?: string[]; exp?: number } | null {
  try {
    const raw = localStorage.getItem('auth_user') ?? localStorage.getItem('pp_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function isExpired(exp?: number): boolean {
  return !!exp && (exp * 1000) < Date.now();
}

function ensureStudentOrRedirect(): true | UrlTree {
  const router = inject(Router);
  const u = readUser();
  if (!u) return router.parseUrl('/auth/login');
  if (isExpired(u.exp)) return router.parseUrl('/auth/login');

  const roles = u.roles ?? [];
  const ok = roles.includes('ROLE_STUDENT') || roles.includes('STUDENT');
  return ok ? true : router.parseUrl('/proyectos-panel');
}

export const studentMatch: CanMatchFn = () => ensureStudentOrRedirect();
export const studentGuard: CanActivateFn = () => ensureStudentOrRedirect();

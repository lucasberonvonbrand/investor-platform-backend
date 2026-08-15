import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

export const studentOnlyGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  try {
    const raw = localStorage.getItem('auth_user');
    const u = raw ? JSON.parse(raw) as { roles?: string[] } : null;
    const roles = (u?.roles ?? []) as string[];

    const isStudent = roles.includes('ROLE_STUDENT') || roles.includes('STUDENT');
    const forbidden = roles.includes('ROLE_INVESTOR') || roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');

    if (isStudent && !forbidden) return true;
    return router.parseUrl('/proyectos-panel');
  } catch {
    return router.parseUrl('/auth/login');
  }
};

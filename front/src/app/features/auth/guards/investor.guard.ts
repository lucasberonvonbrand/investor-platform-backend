import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';

function readRoles(): string[] {
  try {
    const raw = localStorage.getItem('auth_user') ?? localStorage.getItem('pp_user');
    const u = raw ? JSON.parse(raw) as { roles?: string[] } : null;
    return Array.isArray(u?.roles) ? u!.roles! : [];
  } catch { return []; }
}

export const investorMatch: CanMatchFn = () => {
  const router = inject(Router);
  return readRoles().includes('ROLE_INVESTOR') ? true : router.parseUrl('/proyectos-panel');
};

export const investorGuard: CanActivateFn = () => {
  const router = inject(Router);
  return readRoles().includes('ROLE_INVESTOR') ? true : router.parseUrl('/proyectos-panel');
};

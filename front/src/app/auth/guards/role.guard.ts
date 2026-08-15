import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(requiredRole: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const session = auth.getSession();

    if (!session?.roles.includes(requiredRole)) {
      router.navigateByUrl('/auth/login');
      return false;
    }

    return true;
  };
}

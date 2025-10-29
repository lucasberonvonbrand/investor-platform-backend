// Diferenciar entre inversor y estudiante en las rutas
// Si el rol no coincide, redirigir a /dashboard o /configuracion
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../login/auth.service';

export function roleGuard(requiredRole: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const session = auth.getSession();

    if (!session?.roles.includes(requiredRole)) {
      // Redirigir a una página segura y accesible para evitar bucles infinitos.
      router.navigateByUrl('/marquesinas');
      return false;
    }

    return true;
  };
}

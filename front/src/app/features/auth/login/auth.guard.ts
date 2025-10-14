import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
  
    // Usamos el getter 'isLoggedIn' del servicio, que verifica si el token JWT es válido.
    if (auth.isLoggedIn) {
      return true; // Si está logueado, permite el acceso.
    }
  
    return router.createUrlTree(['/auth/login']); // Si no, redirige al login.
};

import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login-page/login-page.component').then(m => m.LoginPageComponent) 
  },
  { 
    path: 'register', 
    loadComponent: () => import('./pages/register-page/register-page.component').then(m => m.RegisterPageComponent) 
  },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./pages/forgot-password-page/forgot-password-page.component').then(m => m.ForgotPasswordPageComponent) 
  },
  { 
    path: 'reset-password', 
    loadComponent: () => import('./pages/reset-password-page/reset-password-page.component').then(m => m.ResetPasswordPageComponent) 
  },
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  }
];

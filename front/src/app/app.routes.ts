import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { roleGuard } from './auth/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'landing' },
  { path: 'landing', loadComponent: () => import('./home/pages/landing-page/landing-page.component').then(m => m.LandingPageComponent) },
  { path: 'auth/login',    loadComponent: () => import('./auth/pages/login-page/login-page.component').then(m => m.LoginPageComponent) },
  { path: 'auth/forgot',   loadComponent: () => import('./auth/pages/forgot-password-page/forgot-password-page.component').then(m => m.ForgotPasswordPageComponent) },
  { path: 'auth/register', loadComponent: () => import('./auth/pages/register-page/register-page.component').then(m => m.RegisterPageComponent) },
  { path: 'auth/reset-password', loadComponent: () => import('./auth/pages/reset-password-page/reset-password-page.component').then(c => c.ResetPasswordPageComponent) },
  { path: 'students/register', loadComponent: () => import('./students/pages/student-registration-page/student-registration-page.component').then(m => m.StudentRegistrationPageComponent) },
  { path: 'investors/register', loadComponent: () => import('./investors/pages/investor-registration-page/investor-registration-page.component').then(m => m.InvestorRegistrationPageComponent) },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      { path: 'home', loadChildren: () => import('./home/home.routes').then(m => m.HOME_ROUTES) },
      
      // New domains lazy loading
      { path: 'home', loadChildren: () => import('./home/home.routes').then(m => m.HOME_ROUTES) },
      { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
      { path: 'projects', loadChildren: () => import('./projects/projects.routes').then(m => m.PROJECTS_ROUTES) },
      { path: 'investors', loadChildren: () => import('./investors/investors.routes').then(m => m.INVESTORS_ROUTES) },
      { path: 'students', loadChildren: () => import('./students/students.routes').then(m => m.STUDENTS_ROUTES) },
      
      // Legacy redirects to maintain compatibility if anyone bookmarked
      { path: 'dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },
      { path: 'roles', redirectTo: 'admin/roles', pathMatch: 'full' },
      { path: 'marquesinas', redirectTo: 'home/landing', pathMatch: 'full' },
      { path: 'noticias', redirectTo: 'home/news', pathMatch: 'full' },
      { path: 'Miperfil', redirectTo: 'students/profile', pathMatch: 'full' },
      { path: 'mi-perfil', redirectTo: 'students/profile', pathMatch: 'full' },
      { path: 'proyectos-participo', redirectTo: 'projects/participant', pathMatch: 'full' },

      // Legal/Contracts static page
      { 
        path: 'legales', 
        loadComponent: () => import('./shared/pages/legal-page/legal-page.component').then(m => m.LegalPageComponent),
        title: 'Legal & Contracts'
      },

    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];

import { Routes } from '@angular/router';
import { authGuard } from './features/auth/login/auth.guard';

// 👉 usar los guards centralizados en /features/auth/guards
import { studentGuard, studentMatch } from './features/auth/guards/student.guard';
import { investorGuard, investorMatch } from './features/auth/guards/investor.guard';
import { roleGuard } from './features/auth/login/role.guard';
import { studentOnlyGuard } from './features/auth/guards/student-only.guard'; // ⬅️ NUEVO

export const routes: Routes = [
  { path: 'auth/login',    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'auth/forgot',   loadComponent: () => import('./features/auth/forgot/forgot.component').then(m => m.ForgotComponent) },
  { path: 'auth/register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'create-student',  loadComponent: () => import('./features/students/students-form/students-form.component').then(m => m.StudentFormComponent) },
  { path: 'create-investor', loadComponent: () => import('./features/investors/investors-form/investors-form.component').then(m => m.InvestorFormComponent) },
  { path: 'auth/reset-password', loadComponent: () => import('./features/auth/reset/reset-password.component').then(c => c.ResetPasswordComponent) },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'proyectos-panel' },
      { path: 'dashboard',        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.PanelComponent) },
      { path: 'proyectos-panel',  loadComponent: () => import('./features/proyectos/projects-panel/projects-panel.component').then(m => m.ProjectsPanelComponent) },
      { path: 'roles',            loadComponent: () => import('./features/roles/roles.component').then(m => m.RolesComponent) },
      { path: 'configuracion',    loadComponent: () => import('./features/config/configuracion.component').then(m => m.ConfiguracionComponent) },
      { path: 'estudiante-perfil', canActivate: [authGuard, roleGuard('ROLE_STUDENT')], loadComponent: () => import('./features/students/students-update-form/students-update-form.component').then(m => m.StudentsUpdateComponent)},
      { path: 'inversor-perfil',canActivate: [authGuard, roleGuard('ROLE_INVESTOR')],loadComponent: () => import('./features/investors/investors-update-form/investors-update-form.component').then(m => m.InvestorsUpdateComponent)},
      { path: 'proyectos',        loadComponent: () => import('./features/proyectos/proyectos.component').then(m => m.ProyectosComponent) },
      { path: 'marquesinas',      loadComponent: () => import('./features/marquesina/marquesina.component').then(m => m.MarquesinaComponent) },
      { path: 'mismarquesinas',   loadComponent: () => import('./features/mismarquesinas/mismarquesinas.component').then(m => m.MismarquesinasComponent) },
      { path: 'noticias',         loadComponent: () => import('./features/noticias/noticias.component').then(m => m.NoticiasComponent) },
      { path: 'estudiantes',      loadComponent: () => import('./features/students/students-table/students-table.component').then(m => m.StudentsTableComponent) },
      { path: 'inversores',       loadComponent: () => import('./features/investors/investors-table/investors-table.component').then(m => m.InvestorsTableComponent) },
      { path: 'Miperfil',         redirectTo: 'mi-perfil', pathMatch: 'full' },
      { path: 'mi-perfil',        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },

      // SOLO estudiantes
      {
        path: 'misproyectos', // CORREGIDO: Coincide con el routerLink del menú
        canMatch: [studentMatch],
        canActivate: [studentGuard],
        loadComponent: () =>
          import('./features/proyectos/my-projects-panel/my-projects-panel.component')
            .then(m => m.MyProjectsPanelComponent)
      },

      // NUEVO: Proyectos donde participo (no owner)
      {
        path: 'proyectos-participo',
        canMatch: [studentMatch],
        canActivate: [studentGuard, studentOnlyGuard],
        loadComponent: () =>
          import('./features/proyectos/participant-projects-panel/participant-projects-panel.component')
            .then(m => m.ParticipantProjectsPanelComponent)
      },

      { path: 'legales', loadComponent: () => import('./features/contrato/contract.component').then(m => m.ContratosComponent) },

      // SOLO inversores
      {
        path: 'mis-inversiones',
        canMatch: [investorMatch],
        canActivate: [investorGuard],
        loadComponent: () =>
          import('./features/investors/my-investments-panel/my-investments-panel.component')
            .then(m => m.MyInvestmentsPanelComponent)
      },

      // Detalle maestro del proyecto
      {
        path: 'proyectos-maestro/:id',
        loadComponent: () =>
          import('./features/proyectos/proyectos-maestro/proyectos-maestro.component')
            .then(m => m.ProyectosMaestroComponent)
      },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];

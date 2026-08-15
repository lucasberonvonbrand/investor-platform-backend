import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role.guard';

import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { RolesManagementPageComponent } from './pages/roles-management-page/roles-management-page.component';
import { AdminProjectManagementPageComponent } from './pages/admin-project-management-page/admin-project-management-page.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    component: DashboardPageComponent,
    canActivate: [roleGuard('ROLE_ADMIN')],
    title: 'Admin Dashboard'
  },
  {
    path: 'roles',
    component: RolesManagementPageComponent,
    canActivate: [roleGuard('ROLE_ADMIN')],
    title: 'Roles Management'
  },
  {
    path: 'projects/:id',
    component: AdminProjectManagementPageComponent,
    canActivate: [roleGuard('ROLE_ADMIN')],
    title: 'Project Management'
  }
];

import { Routes } from '@angular/router';
import { roleGuard } from '../auth/guards/role.guard';
import { authGuard } from '../auth/guards/auth.guard';

import { StudentRegistrationPageComponent } from './pages/student-registration-page/student-registration-page.component';
import { StudentProfilePageComponent } from './pages/student-profile-page/student-profile-page.component';
import { AdminStudentsPageComponent } from './pages/admin-students-page/admin-students-page.component';

export const STUDENTS_ROUTES: Routes = [
  {
    path: 'register',
    component: StudentRegistrationPageComponent
  },
  {
    path: 'profile',
    canActivate: [authGuard, roleGuard('ROLE_STUDENT')],
    component: StudentProfilePageComponent
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ROLE_ADMIN')],
    component: AdminStudentsPageComponent
  }
];

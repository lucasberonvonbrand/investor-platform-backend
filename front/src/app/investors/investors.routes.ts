import { Routes } from '@angular/router';

import { InvestorRegistrationPageComponent } from './pages/investor-registration-page/investor-registration-page.component';
import { InvestorProfilePageComponent } from './pages/investor-profile-page/investor-profile-page.component';
import { AdminInvestorsPageComponent } from './pages/admin-investors-page/admin-investors-page.component';
import { MyInvestmentsPageComponent } from './pages/my-investments-page/my-investments-page.component';
import { InvestmentDetailsPageComponent } from './pages/investment-details-page/investment-details-page.component';

import { authGuard } from '../auth/guards/auth.guard';
import { roleGuard } from '../auth/guards/role.guard';

export const INVESTORS_ROUTES: Routes = [
  {
    path: 'register',
    component: InvestorRegistrationPageComponent,
    title: 'Investor Registration'
  },
  {
    path: 'profile',
    component: InvestorProfilePageComponent,
    canActivate: [authGuard, roleGuard('ROLE_INVESTOR')],
    title: 'My Profile'
  },
  {
    path: 'admin',
    component: AdminInvestorsPageComponent,
    canActivate: [authGuard, roleGuard('ROLE_ADMIN')],
    title: 'Manage Investors'
  },
  {
    path: 'investments',
    component: MyInvestmentsPageComponent,
    canActivate: [authGuard, roleGuard('ROLE_INVESTOR')],
    title: 'My Investments'
  },
  {
    path: 'investments/:investmentId',
    component: InvestmentDetailsPageComponent,
    canActivate: [authGuard, roleGuard('ROLE_INVESTOR')],
    title: 'Investment Details'
  }
];

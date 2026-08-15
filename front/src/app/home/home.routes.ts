import { Routes } from '@angular/router';

import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { NewsPageComponent } from './pages/news-page/news-page.component';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'landing'
  },
  {
    path: 'landing',
    component: LandingPageComponent,
    title: 'Explore Projects'
  },
  {
    path: 'news',
    component: NewsPageComponent,
    title: 'Platform News'
  }
];

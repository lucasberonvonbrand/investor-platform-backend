import { Routes } from '@angular/router';
import { ProjectCreationPageComponent } from './pages/project-creation-page/project-creation-page.component';
import { MyProjectsPageComponent } from './pages/my-projects-page/my-projects-page.component';
import { ProjectDetailsPageComponent } from './pages/project-details-page/project-details-page.component';
import { ProjectsCatalogPageComponent } from './pages/projects-catalog-page/projects-catalog-page.component';
import { InvestedProjectsPageComponent } from './pages/invested-projects-page/invested-projects-page.component';
import { AdminProjectsPageComponent } from './pages/admin-projects-page/admin-projects-page.component';
import { ParticipantProjectsPageComponent } from './pages/participant-projects-page/participant-projects-page.component';
import { RiskAnalysisPageComponent } from './pages/risk-analysis-page/risk-analysis-page.component';

export const PROJECTS_ROUTES: Routes = [
  {
    path: 'create',
    component: ProjectCreationPageComponent,
    title: 'Create Project'
  },
  {
    path: 'my-projects',
    component: MyProjectsPageComponent,
    title: 'My Projects'
  },
  {
    path: 'participant',
    component: ParticipantProjectsPageComponent,
    title: 'Participating Projects'
  },
  {
    path: 'details/:id',
    component: ProjectDetailsPageComponent,
    title: 'Project Details'
  },
  {
    path: 'catalog',
    component: ProjectsCatalogPageComponent,
    title: 'Projects Catalog'
  },
  {
    path: 'catalog/tag/:tag',
    component: ProjectsCatalogPageComponent,
    title: 'Projects Catalog by Tag'
  },
  {
    path: 'invested',
    component: InvestedProjectsPageComponent,
    title: 'My Invested Projects'
  },
  {
    path: 'analysis/:id',
    component: RiskAnalysisPageComponent,
    title: 'Risk Analysis'
  },
  {
    path: 'admin',
    component: AdminProjectsPageComponent,
    title: 'Admin Projects'
  }
];

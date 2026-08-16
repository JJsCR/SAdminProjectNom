import { Routes } from '@angular/router';
import { ProjectsManagementComponent } from './containers/projects-management/projects-management.component';
import { ProjectDetailComponent } from './containers/project-detail/project-detail.component';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    component: ProjectsManagementComponent,
  },
  {
    path: 'detail/:id',
    component: ProjectDetailComponent,
  },
];

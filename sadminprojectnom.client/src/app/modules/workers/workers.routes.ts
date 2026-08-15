import { Routes } from '@angular/router';
import { WorkersPageComponent } from './containers/workers-page/workers-page.component';

export const WORKERS_ROUTES: Routes = [
  {
    path: '',
    component: WorkersPageComponent,
  },
];

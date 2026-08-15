import { Routes } from '@angular/router';
import { ClientsPageComponent } from './containers/clients-page/clients-page.component';

export const CLIENTS_ROUTES: Routes = [
  {
    path: '',
    component: ClientsPageComponent,
  },
];

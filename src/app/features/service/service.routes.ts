import { Routes } from '@angular/router';
import { ServiceListComponent } from './service-list/service-list.component';
import { ServiceDetailsComponent } from './service-details/service-details.component';

export const SERVICE_ROUTES: Routes = [
  { path: '', component: ServiceListComponent },
  { path: ':id', component: ServiceDetailsComponent }
];

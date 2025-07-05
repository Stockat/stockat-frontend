import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceListComponent } from './service-list/service-list.component';
import { RouterModule } from '@angular/router';
import { SERVICE_ROUTES } from './service.routes';
import { ServiceDetailsComponent } from './service-details/service-details.component';



@NgModule({
  // declarations: [ServiceListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(SERVICE_ROUTES),
    ServiceListComponent,
    ServiceDetailsComponent
  ]
})
export class ServiceModule { }

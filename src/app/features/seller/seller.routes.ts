import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AllStocksComponent } from "./stocks/all-stocks/all-stocks.component";
import { SellerServiceListComponent } from "./services/seller-service-list/seller-service-list.component";
import { SellerServiceDetailsPageComponent } from './services/seller-service-details-page/seller-service-details-page.component';

export const sellerRoutes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'stocks',
        component: AllStocksComponent
    },
    {
      path: 'services',
      component: SellerServiceListComponent
    },
    {
      path: 'services/:id',
      component: SellerServiceDetailsPageComponent
    }

];

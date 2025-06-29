import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AllStocksComponent } from "./stocks/all-stocks/all-stocks.component";

export const sellerRoutes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'stocks',
        component: AllStocksComponent
    }
    
];
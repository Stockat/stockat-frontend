import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AllStocksComponent } from "./stocks/all-stocks/all-stocks.component";
import { AddproductComponent } from "./products/addproduct/addproduct.component";

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
        path: 'add-product',
        component: AddproductComponent
    }

];
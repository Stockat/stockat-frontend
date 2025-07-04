import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AllStocksComponent } from "./stocks/all-stocks/all-stocks.component";
import { AddproductComponent } from "./products/addproduct/addproduct.component";
import { AddStockComponent } from "./stocks/add-stock/add-stock.component";
import { UpdateStockComponent } from "./stocks/update-stock/update-stock.component";

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
        path: 'stocks/add/:id',
        component: AddStockComponent
    },
    {
        path: 'stocks/update/:id',
        component: UpdateStockComponent
    },
    {
        path: 'add-product',
        component: AddproductComponent
    }

];
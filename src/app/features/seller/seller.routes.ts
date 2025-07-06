import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AllStocksComponent } from "./stocks/all-stocks/all-stocks.component";
import { AddproductComponent } from "./products/addproduct/addproduct.component";
import { SellerServiceListComponent } from "./services/seller-service-list/seller-service-list.component";
import { SellerServiceDetailsPageComponent } from './services/seller-service-details-page/seller-service-details-page.component';
import { UpdateProductComponent } from "./products/update-product/update-product.component";
import { ViewProductComponent } from "./products/view-product/view-product.component";

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
    },
    {
        path: 'edit-product/:id',
        component: UpdateProductComponent
    },
    {
        path: 'view-product',
        component: ViewProductComponent
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

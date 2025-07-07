import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AllStocksComponent } from "./stocks/all-stocks/all-stocks.component";
import { AddproductComponent } from "./products/addproduct/addproduct.component";
import { AuctionsViewComponent } from "./Auctions/auctions-view/auctions-view.component";
import { AuctionInfoComponent } from "./Auctions/auction-info/auction-info.component";
import { AuctionAnalysisComponent } from "./Auctions/auction-analysis/auction-analysis.component";
import { AuctionOrderManagementComponent } from "./Auctions/auction-order-management/auction-order-management.component";
import { SellerServiceListComponent } from "./services/seller-service-list/seller-service-list.component";
import { SellerServiceDetailsPageComponent } from './services/seller-service-details-page/seller-service-details-page.component';
import { UpdateProductComponent } from "./products/update-product/update-product.component";
import { ViewProductComponent } from "./products/view-product/view-product.component";
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
    },
    {
      path: 'orders',
      loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent)
    },
    {
      path: 'orders/requests',
    loadComponent: () =>
      import('./orders/Requests/request-order/request-order.component').then(
        (m) => m.RequestOrderComponent
      ),
  },
    {
        path: 'auctions',
        component: AuctionsViewComponent
    },
    {
        path: 'auctions/:id',
        component: AuctionInfoComponent
    },
    {
        path: 'analysis',
        component: AuctionAnalysisComponent
    },
    {
        path: 'auctionorders',
        component: AuctionOrderManagementComponent
    }
        



];
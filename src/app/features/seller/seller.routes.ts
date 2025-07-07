import { Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AllStocksComponent } from "./stocks/all-stocks/all-stocks.component";
import { AddproductComponent } from "./products/addproduct/addproduct.component";
import { AuctionsViewComponent } from "./Auctions/auctions-view/auctions-view.component";
import { AuctionInfoComponent } from "./Auctions/auction-info/auction-info.component";
import { AuctionAnalysisComponent } from "./Auctions/auction-analysis/auction-analysis.component";
import { AuctionOrderManagementComponent } from "./Auctions/auction-order-management/auction-order-management.component";

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
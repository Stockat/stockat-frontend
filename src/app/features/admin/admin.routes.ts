import { Routes } from "@angular/router";

export const adminRoutes: Routes = [
    {
        path: 'orders',
        loadComponent: () => import('./orders/orders.component').then(m => m.AdminOrdersComponent)
    },
    {
        path: 'products',
        loadComponent: () => import('./products/manageproducts/manageproducts.component').then(m => m.ManageproductsComponent)
    },
    {
        path: 'auctions',
        loadComponent: () => import('../seller/Auctions/auctions-view/auctions-view.component').then(m => m.AuctionsViewComponent)
    },
    {
        path: 'auctionorders',
        loadComponent: () => import('../seller/Auctions/auction-order-management/auction-order-management.component').then(m => m.AuctionOrderManagementComponent)
    }

]

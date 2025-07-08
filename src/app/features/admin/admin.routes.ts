import { Routes } from "@angular/router";

export const adminRoutes: Routes = [
    {
        path: 'orders',
        loadComponent: () => import('./orders/orders.component').then(m => m.AdminOrdersComponent)
    },
    {
        path: 'products',
        loadComponent: () => import('./products/manageproducts/manageproducts.component').then(m => m.ManageproductsComponent)
    }
]

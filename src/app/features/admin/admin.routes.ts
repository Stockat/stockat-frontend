import { Routes } from "@angular/router";

export const adminRoutes: Routes = [
    {
        path: 'orders',
        loadComponent: () => import('./orders/orders.component').then(m => m.AdminOrdersComponent)
    },
    {
        path: 'orders/analysis',
        loadComponent: () => import('./orders/order-analysis/order-analysis.component').then(m => m.OrderAnalysisComponent)
    },
    {
        path: 'products',
        loadComponent: () => import('./products/manageproducts/manageproducts.component').then(m => m.ManageproductsComponent)
    },
    {
        path: 'users',
        loadComponent: () => import('./user/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'verifications',
        loadComponent: () => import('./user/user-verification.component').then(m => m.UserVerificationComponent)
      },
      {
        path: 'punishments',
        loadComponent: () => import('./user/user-punishment.component').then(m => m.UserPunishmentComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./services/pending-services/pending-services.component').then(m => m.PendingServicesComponent)
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      }
]

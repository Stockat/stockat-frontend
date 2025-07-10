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
        path: 'categories',
        loadComponent: () => import('./category/category-management.component').then(m => m.CategoryManagementComponent)
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
        path: 'service-edit-requests',
        loadComponent: () => import('./services/service-edit-requests/service-edit-requests.component').then(m => m.ServiceEditRequestsComponent)
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      }
]

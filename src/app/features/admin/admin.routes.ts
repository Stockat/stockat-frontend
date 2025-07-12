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
        path: 'product-details/:id',
        loadComponent: () => import('./products/product-details/product-details.component').then(m => m.ProductDetailsComponent)
    },
    {
        path: 'categories',
        loadComponent: () => import('./category/category-management.component').then(m => m.CategoryManagementComponent)
    },
    {
        path: 'tags',
        loadComponent: () => import('./tag/tag-management.component').then(m => m.TagManagementComponent)
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
        path: 'service-requests',
        loadComponent: () => import('./services/service-requests/service-requests.component').then(m => m.ServiceRequestsComponent)
      },
      {
        path: 'tracking',
        loadComponent: () => import('../tracking/tracking.component').then(m => m.TrackingComponent)
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
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

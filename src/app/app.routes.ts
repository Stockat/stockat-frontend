import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { SellerLayoutComponent } from './layouts/seller-layout/seller-layout.component';
import { sellerRoutes } from './features/seller/seller.routes';
import { ProductCardComponent } from './features/Home/product-card/product-card.component';
import { ProductDetailsComponent } from './features/ProductDetails/product-details/product-details.component';
import { ServiceRequestDetailsComponent } from './features/profile/service-request-details.component';
import { ProductStocksComponent } from './features/product-stocks/product-stocks.component';
import { SellerProfileComponent } from './features/seller/seller-profile/seller-profile.component';

export const routes: Routes = [
  {
    path: '',
    component: ProductCardComponent,
    children: [],
  },
  { 
    path: 'ProductDetails/:id',
    component: ProductDetailsComponent
  },
  {
    path: 'product-stocks/:id',
    component: ProductStocksComponent
  },
  // Auth
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'confirm-email',
    loadComponent: () =>
      import('./features/auth/confirm-email/confirm-email.component').then(
        (m) => m.ConfirmEmailComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    children: [
      { path: 'requests/:id', component: ServiceRequestDetailsComponent }
    ]
  },
  // Seller
  {
    path: 'seller',
    component: SellerLayoutComponent,
    children: sellerRoutes,
  },
  // Admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'users',
        loadComponent: () => import('./features/admin/user/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'verifications',
        loadComponent: () => import('./features/admin/user/user-verification.component').then(m => m.UserVerificationComponent)
      },
      {
        path: 'punishments',
        loadComponent: () => import('./features/admin/user/user-punishment.component').then(m => m.UserPunishmentComponent)
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      }
    ]
  },
  // Services
  {
    path: 'services',
    loadChildren: () => import('./features/service/service.module').then(m => m.ServiceModule)
  },
  //Auction
  {
    path: 'auctions',
    loadComponent: () => import('./features/Auction/auctions-list/auctions-list.component').then(m => m.AuctionsListComponent)
  },
  {
    path: 'auction/:id',
    loadComponent: () => import('./features/Auction/auction-details/auction-details.component').then(m => m.AuctionDetailsComponent)
  },
  // Seller Profile
  {
    path: 'seller-profile/:id',
    component: SellerProfileComponent
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./features/chat/chat-page/chat-page.component').then(
        (m) => m.ChatPageComponent
      ),
  },
  {
    path: 'order-process',
    loadComponent: () => import('./features/order-process/order-process.component').then(m => m.OrderProcessComponent)
  },
];

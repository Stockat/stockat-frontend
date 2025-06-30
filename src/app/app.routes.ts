import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { SellerLayoutComponent } from './layouts/seller-layout/seller-layout.component';
import { sellerRoutes } from './features/seller/seller.routes';
import { ProductCardComponent } from './features/Home/product-card/product-card.component';
import { ProductDetailsComponent } from './features/ProductDetails/product-details/product-details.component';

export const routes: Routes = [
  {
    path: '',
    component: ProductCardComponent,
    children: [],
  },
  { path: 'ProductDetails/:id', component: ProductDetailsComponent },
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
  },
  // Admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
  },
  // Seller
  {
    path: 'seller',
    component: SellerLayoutComponent,
    children: sellerRoutes,
  },
];

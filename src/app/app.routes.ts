import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { SellerLayoutComponent } from './layouts/seller-layout/seller-layout.component';
import { sellerRoutes } from './features/seller/seller.routes';

export const routes: Routes = [
    // Auth
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    },
    {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    },
    {
        path: 'confirm-email',
        loadComponent: () => import('./features/auth/confirm-email/confirm-email.component').then(m => m.ConfirmEmailComponent)
    },
    // Admin
    {
        path: 'admin',
        component: AdminLayoutComponent
    },
    // Seller
    {
        path: 'seller',
        component: SellerLayoutComponent,
        children: sellerRoutes
    }
];

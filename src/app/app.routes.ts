import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { SellerLayoutComponent } from './layouts/seller-layout/seller-layout.component';
import { sellerRoutes } from './features/seller/seller.routes';
import { adminRoutes } from './features/admin/admin.routes';
import { ProductCardComponent } from './features/Home/product-card/product-card.component';
import { ProductDetailsComponent } from './features/ProductDetails/product-details/product-details.component';
import { ServiceRequestDetailsComponent } from './features/profile/service-request-details.component';
import { ProductStocksComponent } from './features/product-stocks/product-stocks.component';
import { SellerProfileComponent } from './features/seller/seller-profile/seller-profile.component';
import { RoleGuard } from './core/gaurds/RoleGuard';

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
  // End Auth
  // Seller
  {
    path: 'seller',
    component: SellerLayoutComponent,
    children: sellerRoutes,
    canActivate: [RoleGuard],
    data: { roles: ['Seller'] }
  },
  // End Seller
  // Admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: adminRoutes,
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  // End Admin
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
    {
      path: 'auctions/mybids',
      loadComponent: () => import('./features/Auction/buyer-bids/buyer-bids.component').then(m => m.BuyerBidsComponent)
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
    path: 'chat/:userId',
    loadComponent: () =>
      import('./features/chat/chat-page/chat-page.component').then(
        (m) => m.ChatPageComponent
      ),
  },
  {
    path: 'order-process',
    loadComponent: () => import('./features/order-process/order-process.component').then(m => m.OrderProcessComponent)
  },
  {
    path: 'request/:productId',
    loadComponent: () => import('./features/request/make-request.component').then(m => m.MakeRequestComponent)
  },
  // Chatbot
  {
    path: 'chatbot',
    loadComponent: () => import('./features/chatbot/chatbot.component').then(m => m.ChatbotComponent)
  },
  {
    path: 'unauthorized',
    component: ProductCardComponent,
  }
];

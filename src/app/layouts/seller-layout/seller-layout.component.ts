import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DashNavbarComponent } from '../../shared/components/dash-navbar/dash-navbar.component';
import { MenuItem } from 'primeng/api';
import { RouterOutlet } from '@angular/router';
import { endWith } from 'rxjs';

@Component({
  selector: 'app-seller-layout',
  imports: [SidebarComponent, DashNavbarComponent, RouterOutlet],
  templateUrl: './seller-layout.component.html',
  styleUrl: './seller-layout.component.css'
})
export class SellerLayoutComponent {


  SidebarVisible: boolean = false;

  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Products',
        icon: 'ti ti-shopping-cart',
        badge: '5',
        items: [
          {
            label: 'Add Product',
            icon: 'ti ti-plus',
            route: '/seller/add-product',
            routerLink: '/seller/add-product',

          },
          {
            label: 'All Products',
            icon: 'ti ti-box',
            route: '/seller/view-product',
            routerLink: '/seller/view-product',
            routerLinkActiveOptions: { endWith: '/seller/products' }
          }
        ]
      },
      {
        label: 'Stocks',
        icon: 'ti ti-package',
        items: [
          {
            label: 'All Stocks',
            icon: 'ti ti-packages',
            badge: '3',
            route: '/seller/stocks',
            routerLink: '/seller/stocks',
            routerLinkActiveOptions: { endWith: '/seller/stocks' }
          },
          {
            label: 'Orders',
            icon: 'ti ti-list',
            badge: '6',
            route: '/seller/orders',
            routerLink: '/seller/orders',
            routerLinkActiveOptions: { endWith: '/seller/orders' }
          },
          {
            label: 'Requests',
            icon: 'ti ti-file-pencil',
            route: '/seller/orders/requests',
            routerLink: '/seller/orders/requests',
            routerLinkActiveOptions: { endWith: '/seller/orders/requests' }
          }
        ]
      },
      {
        label: 'Services',
        icon: 'ti ti-settings-bolt',
        items: [
          {
            label: 'All Services',
            icon: 'pi pi-cog',
            route: '/seller/services',
            routerLink: '/seller/services',
            routerLinkActiveOptions: { endWith: '/seller/services' }
          },
          {
            label: 'Analytics',
            icon: 'pi pi-chart-bar',
            route: '/seller/service-analytics',
            routerLink: '/seller/service-analytics',
            routerLinkActiveOptions: { endWith: '/seller/service-analytics' }
          }
        ]
      },
      {
        label: 'Auctions',
        icon: 'ti ti-gavel',
        items: [
          {
            label: 'My Auctions',
            icon: 'pi pi-briefcase',
            // badge: '3',
            route: '/seller/auctions',
            routerLink: '/seller/auctions',
            routerLinkActiveOptions: { exact: true }
          },
          {
            label: 'Auction Orders',
            icon: 'pi pi-shopping-cart',
            // badge: '3',
            route: '/seller/auctionorders',
            routerLink: '/seller/auctionorders',
            routerLinkActiveOptions: { exact: true }
          },
          {
            label: 'Analytics',
            icon: 'pi pi-chart-bar',
            // badge: '3',
            route: '/seller/analysis',
            routerLink: '/seller/analysis',
            routerLinkActiveOptions: { exact: true }
          },

        ]
      },
      {
        label: 'AI Assistant',
        icon: 'ti ti-robot',
        items: [
          {
            label: 'Chat with AI',
            icon: 'pi pi-comments',
            route: '/chatbot',
            routerLink: '/chatbot'
          }
        ]
      }
    ];
  }

  toggleSidebar() {
    this.SidebarVisible = !this.SidebarVisible;
  }

}

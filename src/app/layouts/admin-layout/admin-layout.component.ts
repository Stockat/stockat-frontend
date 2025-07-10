import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DashNavbarComponent } from '../../shared/components/dash-navbar/dash-navbar.component';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [SidebarComponent, DashNavbarComponent, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  SidebarVisible: boolean = false;

  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Orders',
        icon: 'ti ti-list-check',
        items: [
          {
            label: 'Orders',
            icon: 'ti ti-list-check',
            route: '/admin/orders',
          },
          {
            label: 'Order Analysis',
            icon: 'pi pi-chart-line',
            route: '/admin/orders/analysis',
          },
        ],
      },
      {
        label: 'Content Management',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'Products',
            icon: 'pi pi-box',
            routerLink: '/admin/products',
          },
          {
            label: 'Categories',
            icon: 'pi pi-tags',
            routerLink: '/admin/categories',
          },
          {
            label: 'Tags',
            icon: 'pi pi-tag',
            routerLink: '/admin/tags',
          },
        ],
      },
      {
        label: 'Users',
        icon: 'pi pi-users',
        items: [
          {
            label: 'User Management',
            icon: 'pi pi-user-edit',
            routerLink: '/admin/users',
          },
          {
            label: 'Verification Requests',
            icon: 'pi pi-file-edit',
            routerLink: '/admin/verifications',
          },
          {
            label: 'Punishments',
            icon: 'pi pi-shield',
            routerLink: '/admin/punishments',
          },
        ],
      },
      {
        label: 'AI Assistant',
        icon: 'pi pi-robot',
        items: [
          {
            label: 'Chat with AI',
            icon: 'pi pi-comments',
            route: '/chatbot',
            routerLink: '/chatbot',
          },
        ],
      },
    ];
  }

  toggleSidebar() {
    this.SidebarVisible = !this.SidebarVisible;
  }
}

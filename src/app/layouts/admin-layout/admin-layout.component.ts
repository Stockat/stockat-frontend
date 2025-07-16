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
                label: 'Dashboard',
                icon: 'ti ti-home',
                items: [
                    {
                        label: 'Statistics',
                        icon: 'pi pi-chart-bar',
                        route: '/admin/orders/analysis',
                        routerLink: '/admin/orders/analysis'
                    },
                    {
                        label: 'Audit Log',
                        icon: 'ti ti-report-search',
                        route: '/admin/audit',
                        routerLink: '/admin/audit'
                    }
                ]
            },
            {
                label: 'Products',
                icon: 'pi pi-box',
                items: [
                    {
                        label: 'All Products',
                        icon: 'ti ti-box',
                        route: '/admin/products',
                        routerLink: '/admin/products',
                        routerLinkActiveOptions: { exact: true }
                    },
                    {
                        label: 'Categories',
                        icon: 'ti ti-category',
                        route: '/admin/categories',
                        routerLink: '/admin/categories',
                        routerLinkActiveOptions: { exact: true }
                    },
                    {
                        label: 'Tags',
                        icon: 'ti ti-hash',
                        route: '/admin/tags',
                        routerLink: '/admin/tags',
                        routerLinkActiveOptions: { exact: true }
                    }
                ]
            },
            {
                label: 'Orders',
                icon: 'ti ti-list-check',
                items: [
                     {
                        label: 'Orders',
                        icon: 'ti ti-list-check',
                        route: '/admin/orders'
                        , routerLink: '/admin/orders',
                        routerLinkActiveOptions: { exact: true }
                    }
                ]
            },
            {
                label: 'Auctions',
                icon: 'ti ti-gavel',
                items: [
                  {
                    label: 'All Auctions',
                    icon: 'ti ti-gavel',
                    route: '/admin/auctions',
                    routerLink: '/admin/auctions',
                    routerLinkActiveOptions: { exact: true },
                  },
                    {
                        label: 'Orders',
                        icon: 'ti ti-list-check',
                        route: '/admin/auctionorders',
                        routerLink: '/admin/auctionorders',
                        routerLinkActiveOptions: { exact: true }
                    }
                ]
            },
            {
                label: 'Users',
                icon: 'pi pi-users',
                items: [
                    {
                        label: 'User Management',
                        icon: 'pi pi-user-edit',
                        routerLink: '/admin/users'
                    },
                    {
                        label: 'Verification Requests',
                        icon: 'pi pi-file-edit',
                        routerLink: '/admin/verifications'
                    },
                    {
                        label: 'Punishments',
                        icon: 'pi pi-shield',
                        routerLink: '/admin/punishments'
                    }
                ]
            },
            {
                label: 'Services',
                icon: 'pi pi-briefcase',
                items: [
                    {
                        label: 'Service Management',
                        icon: 'pi pi-clock',
                        routerLink: '/admin/services'
                    },
                    {
                        label: 'Service Edit Requests',
                        icon: 'pi pi-pencil',
                        routerLink: '/admin/service-edit-requests'
                    },
                    {
                        label: 'Service Requests',
                        icon: 'pi pi-list',
                        routerLink: '/admin/service-requests'
                    }
                ]
            },
            {
                label: 'AI Assistant',
                icon: 'pi pi-robot',
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



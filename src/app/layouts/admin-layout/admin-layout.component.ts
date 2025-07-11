import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DashNavbarComponent } from "../../shared/components/dash-navbar/dash-navbar.component";
import { MenuItem } from 'primeng/api';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-admin-layout',
    imports: [SidebarComponent, DashNavbarComponent, RouterOutlet],
    templateUrl: './admin-layout.component.html',
    styleUrl: './admin-layout.component.css'
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
                        route: '/admin/orders'
                    }
                ]
            },
            {
                label: 'Auctions',
                icon: 'ti ti-gavel',
                route: '/admin/auctions',
                routerLink: '/admin/auctions',
                routerLinkActiveOptions: { exact: true },
                items: [
                    {
                        label: 'Orders',
                        icon: 'ti ti-list-check',
                        route: '/admin/auctionorders',
                        routerLink: '/admin/auctionorders',
                        routerLinkActiveOptions: { exact: true }
                    }
                ]
            }
        ];
    }

    toggleSidebar() {
        this.SidebarVisible = !this.SidebarVisible;
    }

}

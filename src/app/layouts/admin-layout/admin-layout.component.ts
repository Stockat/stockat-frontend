import { Component } from '@angular/core';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DashNavbarComponent } from "../../shared/components/dash-navbar/dash-navbar.component";
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-admin-layout',
  imports: [SidebarComponent, DashNavbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {

  SidebarVisible:boolean=false;

  items: MenuItem[] = [];

  ngOnInit() {
        this.items = [
            {
                label: 'Mail',
                icon: 'pi pi-envelope',
                badge: '5',
                items: [
                    {
                        label: 'Compose',
                        icon: 'pi pi-file-edit',
                        shortcut: '⌘+N'
                    },
                    {
                        label: 'Inbox',
                        icon: 'pi pi-inbox',
                        badge: '5'
                    },
                    {
                        label: 'Sent',
                        icon: 'pi pi-send',
                        shortcut: '⌘+S'
                    },
                    {
                        label: 'Trash',
                        icon: 'pi pi-trash',
                        shortcut: '⌘+T'
                    }
                ]
            },
            {
                label: 'Reports',
                icon: 'pi pi-chart-bar',
                shortcut: '⌘+R',
                items: [
                    {
                        label: 'Sales',
                        icon: 'pi pi-chart-line',
                        badge: '3'
                    },
                    {
                        label: 'Products',
                        icon: 'pi pi-list',
                        badge: '6'
                    }
                ]
            },
            {
                label: 'Profile',
                icon: 'pi pi-user',
                shortcut: '⌘+W',
                items: [
                    {
                        label: 'Settings',
                        icon: 'pi pi-cog',
                        shortcut: '⌘+O'
                    },
                    {
                        label: 'Privacy',
                        icon: 'pi pi-shield',
                        shortcut: '⌘+P'
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

  toggleSidebar()
  {
    this.SidebarVisible =!this.SidebarVisible;
  }

}

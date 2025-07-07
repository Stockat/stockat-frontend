import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, DrawerModule, AvatarModule, ButtonModule, PanelMenuModule, BadgeModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {

  @Input() visible:boolean = false;
  @Input() items:MenuItem[] = [];
  @Output() menuItemClicked = new EventEmitter<void>();

  constructor(private router: Router, private authService: AuthService) {}

  goToAccount() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout().subscribe();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { UserManagementComponent } from './user-management.component';
import { UserVerificationComponent } from './user-verification.component';
import { UserPunishmentComponent } from './user-punishment.component';

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TabViewModule,
    CardModule,
    UserManagementComponent,
    UserVerificationComponent,
    UserPunishmentComponent
  ],
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css']
})
export class AdminUserManagementComponent implements OnInit {
  activeTabIndex = 0;

  constructor() { }

  ngOnInit() {
  }

  onTabChange(event: any) {
    this.activeTabIndex = event.index;
  }
} 
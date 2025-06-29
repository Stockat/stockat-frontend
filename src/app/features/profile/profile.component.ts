import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  activeTab: string = 'about';

  switchTab(tab: string) {
    this.activeTab = tab;
  }
}

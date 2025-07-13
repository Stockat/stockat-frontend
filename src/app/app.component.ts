import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { ChatbotComponent } from './features/chatbot/chatbot.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [MenubarModule, MenuModule, ButtonModule, RouterOutlet, ChatbotComponent, CommonModule, RouterModule],
})
export class AppComponent {
  title = 'Stockat';
  showChatbot = false;


  constructor(public router: Router, public authService: AuthService) {}
  isLoggedIn(): boolean {
    return !!this.authService.getAccessToken();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToAccount() {
    this.router.navigate(['/profile']);
  }

  onLogout() {
    this.authService.logout().subscribe();
  }


  profileMenuItems: MenuItem[] = [
    { label: 'Profile', icon: 'pi pi-user', command: () => this.onProfile() },
    { label: 'Settings', icon: 'pi pi-cog', command: () => this.onSettings() },
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.onLogout() },
  ];

  onProfile() {
    // Navigate to profile or open profile dialog
    alert('Profile clicked');
  }
  onSettings() {
    // Navigate to settings or open settings dialog
    alert('Settings clicked');
  }
  // onLogout removed (handled above)

  toggleChatbot() {
    this.showChatbot = !this.showChatbot;
  }

  closeChatbot(event: Event) {
    if (event.target === event.currentTarget) {
      this.showChatbot = false;
    }
  }

  goToChat() {
    // Logic to navigate to the chat page
    // For example, you can use Angular's Router to navigate to a specific route
    this.router.navigate(['/chat']);
  }

  navMenuItems: MenuItem[] = [
    { label: 'Products', icon: 'ti ti-box', routerLink: ['/Products'] },
    { label: 'Services', icon: 'ti ti-settings-bolt', routerLink: ['/services'] },
    { label: 'Auctions', icon: 'ti ti-gavel', routerLink: ['/auctions'] },
  ];
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotComponent } from './features/chatbot/chatbot.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatbotComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Stockat';
  showChatbot = false;

  toggleChatbot() {
    this.showChatbot = !this.showChatbot;
  }

  closeChatbot(event: Event) {
    if (event.target === event.currentTarget) {
      this.showChatbot = false;
    }
  }
}

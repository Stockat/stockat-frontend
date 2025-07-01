import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent {
  message: string = '';
  @Output() send = new EventEmitter<string>();
  error: string | null = null;

  sendMessage() {
    if (!this.message.trim()) {
      this.error = 'Message is required.';
      return;
    }
    this.error = null;
    this.send.emit(this.message);
    this.message = '';
  }
}

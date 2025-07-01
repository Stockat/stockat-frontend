import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessageDto } from '../../../core/models/chatmodels/chat-models';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, AvatarModule, ButtonModule, BadgeModule],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent {
  @Input() messages: ChatMessageDto[] = [];
  @Output() sendMessage = new EventEmitter<string>();
  @Output() reactToMessage = new EventEmitter<{ messageId: number, reaction: string }>();
  @Output() replyToMessage = new EventEmitter<{ messageId: number, content: string }>();
  @Output() deleteMessage = new EventEmitter<number>();
}

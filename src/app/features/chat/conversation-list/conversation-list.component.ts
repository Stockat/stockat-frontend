import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatConversationDto, UserChatInfoDto, ChatMessageDto } from '../../../core/models/chatmodels/chat-models';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.css']
})
export class ConversationListComponent {
  @Input() conversations: ChatConversationDto[] = [];
  @Input() selectedConversationId: string | null = null;
  @Output() selectConversation = new EventEmitter<ChatConversationDto>();
  @Output() startChat = new EventEmitter<UserChatInfoDto>();

  searchQuery = '';
  searchResults: UserChatInfoDto[] = [];

  constructor(private chatService: ChatService) {}

  onSelect(conversation: ChatConversationDto) {
    this.selectConversation.emit(conversation);
  }

  onSearch() {
    if (this.searchQuery.trim().length === 0) {
      this.searchResults = [];
      return;
    }
    this.chatService.searchUsers(this.searchQuery).subscribe(users => {
      this.searchResults = users;
    });
  }

  startChatWithUser(user: UserChatInfoDto) {
    this.startChat.emit(user);
    this.searchResults = [];
    this.searchQuery = '';
  }

  getUnreadCount(conv: ChatConversationDto): number {
    if (!conv.messages) return 0;
    return conv.messages.filter((m: ChatMessageDto) => !m.isRead).length;
  }

  loadMore() {
    // TODO: Implement pagination logic for loading more conversations
  }
}

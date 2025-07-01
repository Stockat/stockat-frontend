import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat.service';
import { ChatConversationDto, ChatMessageDto, UserChatInfoDto } from '../../../core/models/chatmodels/chat-models';
import { ConversationListComponent } from '../conversation-list/conversation-list.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { MessageInputComponent } from '../message-input/message-input.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, ConversationListComponent, ChatWindowComponent, MessageInputComponent],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit {
  conversations: ChatConversationDto[] = [];
  selectedConversation: ChatConversationDto | null = null;
  messages: ChatMessageDto[] = [];
  isTyping: boolean = false;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.getConversations().subscribe(convs => {
      this.conversations = convs;
      if (convs.length > 0) {
        this.selectConversation(convs[0]);
      }
    });
    this.chatService.message$.subscribe(msg => {
      if (msg && this.selectedConversation && msg.conversationId === this.selectedConversation.conversationId) {
        this.messages = [...this.messages, msg];
      }
    });
    // TODO: subscribe to typing indicator event from SignalR
  }

  selectConversation(conversation: ChatConversationDto) {
    this.selectedConversation = conversation;
    this.chatService.getMessages(conversation.conversationId).subscribe((msgs: ChatMessageDto[]) => {
      this.messages = msgs;
    });
    if (conversation.lastMessage) {
      this.chatService.markMessageAsRead(conversation.lastMessage.messageId).subscribe();
    }
  }

  sendMessage(messageText: string) {
    if (!this.selectedConversation) {
      return;
    }
    this.chatService.sendTextMessage({
      conversationId: this.selectedConversation.conversationId,
      messageText
    }).subscribe((msg: ChatMessageDto) => {
      this.messages = [...this.messages, msg];
    }, err => {
      console.error('Error sending message:', err);
    });
    this.chatService.sendMessageSignalR({
      conversationId: this.selectedConversation.conversationId,
      messageText
    });
  }

  startChatWithUser(user: UserChatInfoDto) {
    // Check if a conversation already exists with this user
    let conversation = this.conversations.find(conv =>
      (conv.user1Id === user.userId || conv.user2Id === user.userId)
    );
    if (conversation) {
      this.selectConversation(conversation);
    } else {
      this.chatService.createConversation(user.userId).subscribe({
        next: (conv) => {
          this.conversations.unshift(conv);
          this.selectConversation(conv);
        },
        error: (err) => {
          // If conversation already exists, try to find and select it
          if (err?.error?.includes('already exists')) {
            let existing = this.conversations.find(conv =>
              (conv.user1Id === user.userId || conv.user2Id === user.userId)
            );
            if (existing) this.selectConversation(existing);
          } else {
            alert('Could not start chat: ' + (err?.error || err));
          }
        }
      });
    }
  }

  // TODO: handle typing indicator, reactions, replies, attachments, etc.
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../core/services/chat.service';
import { ChatConversationDto, ChatMessageDto, UserChatInfoDto } from '../../../core/models/chatmodels/chat-models';
import { ConversationListComponent } from '../conversation-list/conversation-list.component';
import { ChatWindowComponent } from '../chat-window/chat-window.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { jwtDecode } from 'jwt-decode';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, ConversationListComponent, ChatWindowComponent, MessageInputComponent, AvatarModule],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit {
  conversations: ChatConversationDto[] = [];
  selectedConversation: ChatConversationDto | null = null;
  messages: ChatMessageDto[] = [];
  isTyping: boolean = false;
  currentUserId: string | null = null;
  currentUser: any = null;
  currentUserProfileImageUrl: string = 'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc';
  defaultAvatar = 'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc';

  constructor(private chatService: ChatService, private authService: AuthService, private userService: UserService) {}

  ngOnInit() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
      } catch (e) {}
    }
    this.currentUserId = this.authService.getCurrentUserId();
    console.log('LOL:', this.currentUserId);
    this.userService.getCurrentUser().subscribe(res => {
      console.log('Current user:', res.data);
      this.currentUser = res.data;
      if (res.data && res.data.profileImageUrl) {
        this.currentUserProfileImageUrl = res.data.profileImageUrl;
      }
    });
    this.chatService.getConversations().subscribe(convs => {
      this.conversations = convs;
      if (this.conversations.length > 0) {
        this.selectConversation(this.conversations[0]);
      }
    });
    this.chatService.message$.subscribe(msg => {
      if (msg && this.selectedConversation && msg.conversationId === this.selectedConversation.conversationId) {
        this.messages = [...this.messages, msg].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  selectConversation(conversation: ChatConversationDto) {
    this.selectedConversation = conversation;
    this.chatService.getMessages(conversation.conversationId).subscribe((msgs: ChatMessageDto[]) => {
      this.messages = msgs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      setTimeout(() => this.scrollToBottom(), 0);
    });
    if (conversation.lastMessage) {
      this.chatService.markMessageAsRead(conversation.lastMessage.messageId).subscribe();
    }
    setTimeout(() => this.scrollToBottom(), 0);
  }

  scrollToBottom() {
    const el = document.querySelector('.flex-1.overflow-y-auto.mb-4');
    if (el) el.scrollTop = el.scrollHeight;
  }

  sendMessage(messageText: string) {
    if (!this.selectedConversation || !this.currentUserId) {
      return;
    }
    console.log('Current user image:', this.currentUser?.profileImageUrl);
    const optimisticMsg: ChatMessageDto = {
      messageId: Date.now(),
      conversationId: this.selectedConversation.conversationId,
      sender: {
        userId: this.currentUserId,
        fullName: 'You',
        profileImageUrl: this.currentUser?.profileImageUrl || this.defaultAvatar
      },
      messageText,
      isEdited: false,
      isRead: true,
      sentAt: new Date().toISOString(),
      reactions: [],
    };
    this.messages = [...this.messages, optimisticMsg]
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
    setTimeout(() => this.scrollToBottom(), 0);

    this.chatService.sendTextMessage({
      conversationId: this.selectedConversation.conversationId,
      messageText
    }).subscribe((msg: ChatMessageDto) => {
      if (!msg.sender) {
        msg.sender = {
          userId: this.currentUserId!,
          fullName: 'You',
          profileImageUrl: this.currentUser?.profileImageUrl || this.defaultAvatar
        };
      }
      this.messages = this.messages
        .filter(m => m.messageId !== optimisticMsg.messageId)
        .concat(msg)
        .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      setTimeout(() => this.scrollToBottom(), 0);
      this.chatService.getConversations().subscribe(convs => {
        this.conversations = convs;
      });
    }, err => {
      this.messages = this.messages.filter(m => m.messageId !== optimisticMsg.messageId);
      console.error('Error sending message:', err);
    });
    this.chatService.sendMessageSignalR({
      conversationId: this.selectedConversation.conversationId,
      messageText
    });
  }

  startChatWithUser(user: UserChatInfoDto) {
    let conversation = this.conversations.find(conv =>
      (conv.user1Id === user.userId || conv.user2Id === user.userId)
    );
    if (conversation) {
      this.selectConversation(conversation);
    } else {
      this.chatService.createConversation(user.userId).subscribe({
        next: (conv) => {
          if (conv.user1Id === this.currentUserId) {
            conv.user2FullName = user.fullName;
            conv.user2ProfileImageUrl = user.profileImageUrl;
          } else {
            conv.user1FullName = user.fullName;
            conv.user1ProfileImageUrl = user.profileImageUrl;
          }
          this.conversations.unshift(conv);
          this.selectConversation(conv);
        },
        error: (err) => {
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

  getReceiverName(conv: ChatConversationDto | null): string {
    if (!conv || !this.currentUserId) return '';
    if (conv.user1Id === this.currentUserId && conv.user2Id === this.currentUserId) {
      return 'You';
    }
    if (conv.user1Id === this.currentUserId) return conv.user2FullName;
    return conv.user1FullName;
  }

  getReceiverImage(conv: ChatConversationDto | null): string {
    if (!conv || !this.currentUserId) return this.defaultAvatar;
    if (conv.user1Id === this.currentUserId && conv.user2Id === this.currentUserId) {
      return conv.user1ProfileImageUrl || this.defaultAvatar;
    }
    if (conv.user1Id === this.currentUserId) return conv.user2ProfileImageUrl || this.defaultAvatar;
    return conv.user1ProfileImageUrl || this.defaultAvatar;
  }
}

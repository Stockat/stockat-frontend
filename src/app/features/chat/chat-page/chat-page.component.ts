import { Component, OnInit, AfterViewInit } from '@angular/core';
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
import { HubConnection } from '@microsoft/signalr';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, ConversationListComponent, ChatWindowComponent, MessageInputComponent, AvatarModule, ToastModule],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
  providers: [MessageService]
})
export class ChatPageComponent implements OnInit, AfterViewInit {
  conversations: ChatConversationDto[] = [];
  selectedConversation: ChatConversationDto | null = null;
  messages: ChatMessageDto[] = [];
  isTyping: boolean = false;
  typingUserName: string = '';
  currentUserId: string | null = null;
  currentUser: any = null;
  currentUserProfileImageUrl: string = 'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc';
  defaultAvatar = 'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc';

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.chatService.startConnection(token);
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
    
    // Load initial conversations
    this.chatService.getConversations().subscribe(convs => {
      this.conversations = convs;
      // Join all conversation groups for real-time updates
      for (const conv of convs) {
        this.chatService.joinConversation(conv.conversationId);
        console.log('Joined conversation:', conv.conversationId);
      }
      if (this.conversations.length > 0) {
        this.selectConversation(this.conversations[0]);
      }
    });

    // Listen for new conversations created via SignalR
    this.chatService.getConversations$().subscribe(conversations => {
      // Only update if we have new conversations (avoid overwriting existing ones)
      const newConversations = conversations.filter(conv => 
        !this.conversations.some(existing => existing.conversationId === conv.conversationId)
      );
      
      if (newConversations.length > 0) {
        // Replace temporary conversations with real ones
        this.conversations = this.conversations.map(conv => {
          const matchingNew = newConversations.find(newConv => 
            (newConv.user1Id === conv.user1Id && newConv.user2Id === conv.user2Id) ||
            (newConv.user1Id === conv.user2Id && newConv.user2Id === conv.user1Id)
          );
          return matchingNew || conv;
        });
        
        // Add any completely new conversations
        const completelyNew = newConversations.filter(newConv => 
          !this.conversations.some(existing => 
            (existing.user1Id === newConv.user1Id && existing.user2Id === newConv.user2Id) ||
            (existing.user1Id === newConv.user2Id && existing.user2Id === newConv.user1Id)
          )
        );
        
        if (completelyNew.length > 0) {
          this.conversations = [...completelyNew, ...this.conversations];
        }
        
        // Select the real conversation if we have a temporary one selected
        if (this.selectedConversation && this.selectedConversation.conversationId === 0) {
          const realConversation = this.conversations.find(conv => 
            (conv.user1Id === this.selectedConversation!.user1Id && conv.user2Id === this.selectedConversation!.user2Id) ||
            (conv.user1Id === this.selectedConversation!.user2Id && conv.user2Id === this.selectedConversation!.user1Id)
          );
          if (realConversation) {
            this.selectConversation(realConversation);
            
            // Send pending message if there is one
            if (this.pendingMessage) {
              setTimeout(() => {
                this.sendMessage(this.pendingMessage!);
                this.pendingMessage = null;
              }, 500); // Small delay to ensure conversation is fully loaded
            }
          }
        }
      }
    });

    // Listen for new messages in real-time
    this.chatService.message$.subscribe(msg => {
      if (!msg) return;

      // Update sidebar last message for this conversation
      const convIndex = this.conversations.findIndex(c => c.conversationId === msg.conversationId);
      if (convIndex !== -1) {
        this.conversations[convIndex] = {
          ...this.conversations[convIndex],
          lastMessage: msg,
          lastMessageAt: msg.sentAt
        };
      }

      // Patch sender if null to prevent runtime errors
      if (!msg.sender) {
        msg.sender = {
          userId: 'unknown',
          fullName: 'Unknown',
          profileImageUrl: this.defaultAvatar
        };
      }
      // Only show toast if the current user is NOT the sender
      if (msg.sender.userId !== this.currentUserId) {
        this.showNewMessageNotification(msg);
      }
      // Check if this message belongs to the currently selected conversation
      if (this.selectedConversation && Number(msg.conversationId) === Number(this.selectedConversation.conversationId)) {
        // Only add if not duplicate
        if (!this.messages.some(m => m.messageId === msg.messageId)) {
          this.messages = [...this.messages, msg].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
          setTimeout(() => this.scrollToBottom(), 0);
        }
        // Mark as read if the message is not from the current user
        if (msg.sender.userId !== this.currentUserId && !msg.isRead) {
          this.chatService.markMessageAsReadSignalR(msg.messageId);
        }
      } else {
        // This message is for a different conversation
        // Update the conversation in the sidebar with the new message
        const convIndex = this.conversations.findIndex(c => c.conversationId === msg.conversationId);
        if (convIndex !== -1) {
          // Update existing conversation
          this.conversations[convIndex] = {
            ...this.conversations[convIndex],
            lastMessage: msg,
            lastMessageAt: msg.sentAt
          };
        } else {
          // This is a completely new conversation
          const newConv: ChatConversationDto = {
            conversationId: msg.conversationId,
            user1Id: msg.sender.userId,
            user2Id: this.currentUserId!,
            lastMessageAt: msg.sentAt,
            isActive: true,
            createdAt: msg.sentAt,
            messages: [msg],
            lastMessage: msg,
            user1FullName: msg.sender.fullName,
            user2FullName: this.currentUser?.fullName || '',
            user1ProfileImageUrl: msg.sender.profileImageUrl,
            user2ProfileImageUrl: this.currentUser?.profileImageUrl || ''
          };
          this.conversations.unshift(newConv);
          // Join the new conversation group
          this.chatService.joinConversation(msg.conversationId);
        }
      }
    });
    
    // Listen for typing notifications
    this.chatService.typing$.subscribe(typing => {
      if (
        typing &&
        this.selectedConversation &&
        typing.conversationId === this.selectedConversation.conversationId &&
        typing.userId !== this.currentUserId
      ) {
        // Get the typing user's name
        this.typingUserName = this.getReceiverName(this.selectedConversation);
        this.isTyping = true;
        setTimeout(() => {
          this.isTyping = false;
          this.typingUserName = '';
        }, 2000); // Hide after 2s
      }
    });
  }

  private typingTimeout: any;
  private pendingMessage: string | null = null;

  // Method to send typing notification when user starts typing
  onTyping() {
    if (this.selectedConversation && this.selectedConversation.conversationId !== 0) {
      // Clear existing timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      
      // Send typing notification
      this.chatService.sendTypingNotification(this.selectedConversation.conversationId);
      
      // Set timeout to prevent spam
      this.typingTimeout = setTimeout(() => {
        this.typingTimeout = null;
      }, 1000); // Only send typing notification once per second
    }
  }

  // Method to clear conversation context when no conversation is selected
  clearConversationContext() {
    this.chatService.setCurrentConversation(0);
    this.isTyping = false;
    this.typingUserName = '';
  }

  selectConversation(conversation: ChatConversationDto) {
    // Clear typing indicator when switching conversations
    this.isTyping = false;
    this.typingUserName = '';
    
    this.selectedConversation = conversation;
    
    // Set current conversation context for typing events
    this.chatService.setCurrentConversation(conversation.conversationId);
    
    this.chatService.getMessages(conversation.conversationId).subscribe((msgs: ChatMessageDto[]) => {
      this.messages = msgs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      setTimeout(() => this.scrollToBottom(), 0);
      // Mark all unread messages as read
      for (const msg of this.messages) {
        if (msg.sender.userId !== this.currentUserId && !msg.isRead) {
          this.chatService.markMessageAsReadSignalR(msg.messageId);
        }
      }
    });
    if (conversation.lastMessage) {
      this.chatService.markMessageAsReadSignalR(conversation.lastMessage.messageId);
    }
    setTimeout(() => this.scrollToBottom(), 0);
  }

  scrollToBottom() {
    const el = document.querySelector('.flex-1.overflow-y-auto');
    if (el) el.scrollTop = el.scrollHeight;
  }

  sendMessage(messageText: string) {
    if (!this.selectedConversation || !this.currentUserId) {
      return;
    }
    
    // Don't send messages to temporary conversations (conversationId === 0)
    if (this.selectedConversation.conversationId === 0) {
      // Store the message to send it when the conversation is created
      this.pendingMessage = messageText;
      this.messageService.add({
        severity: 'info',
        summary: 'Creating conversation...',
        detail: 'Your message will be sent once the conversation is ready.',
        life: 3000
      });
      return;
    }
    
    // Send via SignalR for real-time
    this.chatService.sendMessageSignalR({
      conversationId: this.selectedConversation.conversationId,
      messageText
    });
    
    // Send typing notification (optional, e.g. on send)
    this.chatService.sendTypingNotification(this.selectedConversation.conversationId);
  }

  startChatWithUser(user: UserChatInfoDto) {
    let conversation = this.conversations.find(conv =>
      (conv.user1Id === user.userId || conv.user2Id === user.userId)
    );
    if (conversation) {
      this.selectConversation(conversation);
    } else {
      // Use SignalR to create the conversation first
      this.chatService.createConversationSignalR(user.userId);
      
      // Create a temporary conversation object for immediate UI feedback
      const tempConversation: ChatConversationDto = {
        conversationId: 0, // Temporary ID (will be replaced)
        user1Id: this.currentUserId!,
        user2Id: user.userId,
        lastMessageAt: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        messages: [],
        lastMessage: null as any,
        user1FullName: this.currentUser?.fullName || '',
        user2FullName: user.fullName,
        user1ProfileImageUrl: this.currentUser?.profileImageUrl || '',
        user2ProfileImageUrl: user.profileImageUrl || ''
      };
      
      // Add to conversations and select it immediately
      this.conversations.unshift(tempConversation);
      this.selectConversation(tempConversation);
    }
  }

  getReceiverName(conv: ChatConversationDto | null): string {
    if (!conv || !this.currentUserId) return '';
    
    // Handle self-chat
    if (conv.user1Id === this.currentUserId && conv.user2Id === this.currentUserId) {
      return 'You';
    }
    
    // Get the other user's name
    if (conv.user1Id === this.currentUserId) {
      return conv.user2FullName || 'Unknown User';
    } else {
      return conv.user1FullName || 'Unknown User';
    }
  }

  getReceiverImage(conv: ChatConversationDto | null): string {
    if (!conv || !this.currentUserId) return this.defaultAvatar;
    
    // Handle self-chat
    if (conv.user1Id === this.currentUserId && conv.user2Id === this.currentUserId) {
      return conv.user1ProfileImageUrl || this.defaultAvatar;
    }
    
    // Get the other user's image
    if (conv.user1Id === this.currentUserId) {
      return conv.user2ProfileImageUrl || this.defaultAvatar;
    } else {
      return conv.user1ProfileImageUrl || this.defaultAvatar;
    }
  }

  showNewMessageNotification(msg: ChatMessageDto) {
    const senderName = msg.sender?.fullName || 'Unknown';
    const text = msg.messageText || '[New message]';
    this.messageService.add({
      severity: 'info',
      summary: `New message from ${senderName}`,
      detail: text,
      life: 4000
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToBottom(), 0);
  }

  handleReaction(event: { messageId: number, reaction: string }) {
    this.chatService.reactToMessageSignalR({
      messageId: event.messageId,
      reactionType: event.reaction
    });
  }

  handleDeleteMessage(messageId: number) {
    this.chatService.deleteMessageSignalR(messageId);
  }

  handleReplyToMessage(event: { messageId: number, content: string }) {
    // For now, just send the reply as a regular message
    // You can enhance this to show the reply context in the UI
    this.sendMessage(event.content);
  }
}

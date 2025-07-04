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
  selectedUserForNewChat: UserChatInfoDto | null = null;
  messages: ChatMessageDto[] = [];
  isTyping: boolean = false;
  typingUserName: string = '';
  currentUserId: string | null = null;
  currentUser: any = null;
  currentUserProfileImageUrl: string = 'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc';
  defaultAvatar = 'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc';
  isCreatingConversation = false;
  isRecording = false;

  // Pagination state
  conversationPage = 1;
  conversationPageSize = 10;
  hasMoreConversations = true;
  isLoadingConversations = false;

  // Message pagination state
  messagePage = 1;
  messagePageSize = 20;
  hasMoreMessages = true;
  isLoadingMessages = false;
  focusTrigger = 0;

  constructor(
    public chatService: ChatService,
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
    
    this.loadInitialConversations();

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

    // Carefully merge real-time message updates (e.g., reactions) into the existing messages array
    this.chatService.getMessages$().subscribe(msgs => {
      if (!msgs || !Array.isArray(msgs)) return;
      let updated = false;
      for (const updatedMsg of msgs) {
        const idx = this.messages.findIndex(m => m.messageId === updatedMsg.messageId);
        if (idx !== -1) {
          this.messages[idx] = { ...this.messages[idx], ...updatedMsg };
          updated = true;
        }
      }
      if (updated) {
        this.messages = [...this.messages];
      }
    });

    // Listen for new messages in real-time
    this.chatService.message$.subscribe(msg => {
      if (!msg) return;
      // Patch sender if null to prevent runtime errors (for all message types)
      if (!msg.sender) {
        msg.sender = {
          userId: this.currentUserId || 'unknown',
          fullName: this.currentUser?.fullName || 'Unknown',
          profileImageUrl: this.currentUser?.profileImageUrl || this.defaultAvatar
        };
      }
      // Update sidebar last message for this conversation
      const convIndex = this.conversations.findIndex(c => c.conversationId === msg.conversationId);
      if (convIndex !== -1) {
        this.conversations[convIndex] = {
          ...this.conversations[convIndex],
          lastMessage: msg,
          lastMessageAt: msg.sentAt,
          messages: [
            ...this.conversations[convIndex].messages.filter(m => m.messageId !== msg.messageId),
            msg
          ].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
        };
        this.conversations = [...this.conversations];
      }
      // Check if this message belongs to the currently selected conversation
      const isOpenChat = this.selectedConversation && Number(msg.conversationId) === Number(this.selectedConversation.conversationId);
      if (isOpenChat) {
        // Carefully update or add the message in the messages array
        const idx = this.messages.findIndex(m => m.messageId === msg.messageId);
        if (idx !== -1) {
          this.messages[idx] = { ...this.messages[idx], ...msg };
        } else {
          this.messages = [...this.messages, msg];
        }
        this.messages = [...this.messages].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
        setTimeout(() => this.scrollToBottom(), 0);
        // Mark as read if the message is not from the current user
        if (msg.sender.userId !== this.currentUserId && !msg.isRead) {
          this.chatService.markMessageAsReadSignalR(msg.messageId);
        }
        // Do NOT show toast or increment unread counter for open chat
        return;
      }
      // For closed chats, show toast and increment unread counter
      if (msg.sender.userId !== this.currentUserId) {
        if (msg.imageUrl) {
          this.messageService.add({
            severity: 'info',
            summary: `New image message from ${msg.sender.fullName}`,
            detail: 'Image received',
            life: 4000
          });
        } else if (msg.voiceUrl) {
          this.messageService.add({
            severity: 'info',
            summary: `New voice message from ${msg.sender.fullName}`,
            detail: 'Voice message received',
            life: 4000
          });
        } else {
          this.showNewMessageNotification(msg);
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

    // Subscribe to MessageRead events and patch the relevant message in this.messages
    this.chatService.hubConnection?.on('MessageRead', (messageId: number, userId: string, isRead: boolean, readAt: string | null) => {
      // Update in chat window
      const idx = this.messages.findIndex(m => m.messageId === messageId);
      if (idx !== -1) {
        this.messages[idx] = { ...this.messages[idx], isRead, readAt };
      }
      // Update in sidebar conversations
      this.conversations = this.conversations.map(conv => ({
        ...conv,
        messages: conv.messages.map(m =>
          m.messageId === messageId ? { ...m, isRead, readAt } : m
        )
      }));
    });

    this.chatService.recording$.subscribe(event => {
      if (
        event &&
        this.selectedConversation &&
        event.conversationId === this.selectedConversation.conversationId &&
        event.userId !== this.currentUserId
      ) {
        // Toggle recording indicator: if already recording, stop; if not recording, start
        if (this.isRecording) {
          console.log('[ChatPage] Stopping recording indicator');
          this.isRecording = false;
        } else {
          console.log('[ChatPage] Starting recording indicator');
          this.isRecording = true;
        }
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
    this.selectedConversation = conversation;
    this.selectedUserForNewChat = null;
    this.messages = [];
    this.messagePage = 1;
    this.hasMoreMessages = true;
    this.focusTrigger++; // Trigger input focus
    this.chatService.getMessages(conversation.conversationId).subscribe((msgs: ChatMessageDto[]) => {
      this.messages = msgs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      this.chatService['messages$'].next(this.messages);
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  scrollToBottom() {
    const el = document.querySelector('.flex-1.overflow-y-auto');
    if (el) el.scrollTop = el.scrollHeight;
  }

  sendAnyMessage(event: { type: 'text' | 'image' | 'voice', content?: string, file?: File }) {
    if (!this.selectedConversation && this.selectedUserForNewChat) {
      this.isCreatingConversation = true;
      this.chatService.createConversationSignalR(this.selectedUserForNewChat.userId);
      const sub = this.chatService.getConversations$().subscribe(convs => {
        const conv = convs.find(c =>
          (c.user1Id === this.currentUserId && c.user2Id === this.selectedUserForNewChat!.userId) ||
          (c.user2Id === this.currentUserId && c.user1Id === this.selectedUserForNewChat!.userId)
        );
        if (conv) {
          this.selectedConversation = conv;
          this.selectedUserForNewChat = null;
          setTimeout(() => {
            if (event.type === 'text') {
              this.chatService.sendMessageSignalR({
                conversationId: conv.conversationId,
                messageText: event.content
              });
            } else if (event.type === 'image') {
              this.chatService.sendImageMessage({
                conversationId: conv.conversationId,
                messageText: event.content,
                image: event.file!
              }).subscribe();
            } else if (event.type === 'voice') {
              this.chatService.sendVoiceMessage({
                conversationId: conv.conversationId,
                messageText: event.content,
                voice: event.file!
              }).subscribe();
            }
            sub.unsubscribe();
            this.isCreatingConversation = false;
          }, 200);
        }
      });
    } else if (this.selectedConversation) {
      if (event.type === 'text') {
        this.chatService.sendMessageSignalR({
          conversationId: this.selectedConversation.conversationId,
          messageText: event.content
        });
      } else if (event.type === 'image') {
        this.chatService.sendImageMessage({
          conversationId: this.selectedConversation.conversationId,
          messageText: event.content,
          image: event.file!
        }).subscribe();
      } else if (event.type === 'voice') {
        this.chatService.sendVoiceMessage({
          conversationId: this.selectedConversation.conversationId,
          messageText: event.content,
          voice: event.file!
        }).subscribe();
      }
    }
  }

  sendMessage(messageText: string) {
    this.sendAnyMessage({ type: 'text', content: messageText });
  }

  sendImageMessage(event: { file: File, messageText?: string }) {
    this.sendAnyMessage({ type: 'image', content: event.messageText, file: event.file });
  }

  sendVoiceMessage(event: { file: File, messageText?: string }) {
    this.sendAnyMessage({ type: 'voice', content: event.messageText, file: event.file });
  }

  startChatWithUser(user: UserChatInfoDto) {
    // Check if a conversation already exists with this user in the loaded list
    const existingConv = this.conversations.find(c =>
      (c.user1Id === this.currentUserId && c.user2Id === user.userId) ||
      (c.user2Id === this.currentUserId && c.user1Id === user.userId)
    );
    if (existingConv) {
      this.selectedConversation = existingConv;
      this.selectedUserForNewChat = null;
      this.chatService.getMessages(existingConv.conversationId).subscribe((msgs: ChatMessageDto[]) => {
        this.messages = msgs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
        this.chatService['messages$'].next(this.messages);
        setTimeout(() => this.scrollToBottom(), 0);
      });
    } else {
      // Try to fetch the conversation directly from the backend
      this.chatService.getConversationWithUser(user.userId).subscribe({
        next: conv => {
          if (conv) {
            this.selectedConversation = conv;
            this.selectedUserForNewChat = null;
            // Join SignalR for real-time updates
            this.chatService.joinConversation(conv.conversationId);
            // Add to sidebar if not already present
            if (!this.conversations.some(c => c.conversationId === conv.conversationId)) {
              this.conversations = [conv, ...this.conversations];
            }
            this.chatService.getMessages(conv.conversationId).subscribe((msgs: ChatMessageDto[]) => {
              this.messages = msgs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
              this.chatService['messages$'].next(this.messages);
              setTimeout(() => this.scrollToBottom(), 0);
            });
          } else {
            this.selectedUserForNewChat = user;
            this.selectedConversation = null;
            this.messages = [];
          }
        },
        error: err => {
          // If 404 Not Found, treat as no conversation
          if (err.status === 404) {
            this.selectedUserForNewChat = user;
            this.selectedConversation = null;
            this.messages = [];
          } else {
            // Optionally handle other errors (show a toast, etc.)
            console.error('Error fetching conversation:', err);
          }
        }
      });
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
      reactionType: event.reaction,
      conversationId: this.selectedConversation!.conversationId
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

  loadInitialConversations() {
    this.conversationPage = 1;
    this.hasMoreConversations = true;
    this.chatService.getConversations(this.conversationPage, this.conversationPageSize).subscribe(convs => {
      this.conversations = convs;
      for (const conv of convs) {
        this.chatService.joinConversation(conv.conversationId);
      }
      if (this.conversations.length > 0) {
        this.selectConversation(this.conversations[0]);
      }
      if (convs.length < this.conversationPageSize) {
        this.hasMoreConversations = false;
      }
    });
  }

  loadMoreConversations() {
    if (!this.hasMoreConversations || this.isLoadingConversations) return;
    this.isLoadingConversations = true;
    this.conversationPage++;
    this.chatService.getConversations(this.conversationPage, this.conversationPageSize).subscribe(convs => {
      for (const conv of convs) {
        // Only join if not already present
        if (!this.conversations.some(c => c.conversationId === conv.conversationId)) {
          this.chatService.joinConversation(conv.conversationId);
        }
      }
      this.conversations = [...this.conversations, ...convs];
      if (convs.length < this.conversationPageSize) {
        this.hasMoreConversations = false;
      }
      this.isLoadingConversations = false;
    });
  }

  onLoadMoreMessages() {
    if (!this.selectedConversation || !this.hasMoreMessages || this.isLoadingMessages) return;
    this.isLoadingMessages = true;
    this.messagePage++;
    this.chatService.getMessages(this.selectedConversation.conversationId, this.messagePage, this.messagePageSize).subscribe((msgs: ChatMessageDto[]) => {
      if (msgs.length < this.messagePageSize) this.hasMoreMessages = false;
      // Prepend older messages
      this.messages = [...msgs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()), ...this.messages];
      this.isLoadingMessages = false;
      // Optionally, maintain scroll position here
    });
  }
}

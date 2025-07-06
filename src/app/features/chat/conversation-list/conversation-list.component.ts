import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatConversationDto, ChatMessageDto, UserChatInfoDto } from '../../../core/models/chatmodels/chat-models';
import { ChatService } from '../../../core/services/chat.service';
import { WhatsappDatePipe } from '../../shared/pipes/whatsapp-date.pipe';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, WhatsappDatePipe],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.css']
})
export class ConversationListComponent {
  @Input() conversations: ChatConversationDto[] = [];
  @Input() selectedConversationId: string | null = null;
  @Input() currentUserId: string | null = null;
  @Input() hasMoreConversations: boolean = true;
  @Input() isLoadingConversations: boolean = false;
  @Output() selectConversation = new EventEmitter<ChatConversationDto>();
  @Output() startChat = new EventEmitter<UserChatInfoDto>();
  @Output() loadMoreConversations = new EventEmitter<void>();

  searchQuery = '';
  searchResults: UserChatInfoDto[] = [];
  defaultProfileImageUrl = 'https://imgs.search.brave.com/mDztPWayQWWrIPAy2Hm_FNfDjDVgayj73RTnUIZ15L0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzE1Lzg0LzQz/LzM2MF9GXzIxNTg0/NDMyNV90dFg5WWlJ/SXllYVI3TmU2RWFM/TGpNQW15NEd2UEM2/OS5qcGc';
  typingConversations = new Set<string>(); // conversationId as string (could be GUID)
  recordingConversations = new Set<string>();

  constructor(private chatService: ChatService) {
    // Subscribe to typing events
    this.chatService.typing$.subscribe(typing => {
      if (typing && typing.userId !== this.currentUserId && typing.conversationId) {
        this.typingConversations.add(typing.conversationId.toString());
        setTimeout(() => this.typingConversations.delete(typing.conversationId.toString()), 2000);
      }
    });
    this.chatService.recording$.subscribe(recording => {
      if (recording && recording.userId !== this.currentUserId && recording.conversationId) {
        console.log('[Sidebar] Recording event for conversation', recording.conversationId);
        // Simple toggle: if already recording, stop; if not recording, start
        const convId = recording.conversationId.toString();
        if (this.recordingConversations.has(convId)) {
          console.log('[Sidebar] Stopping recording indicator for conversation', recording.conversationId);
          this.recordingConversations.delete(convId);
        } else {
          console.log('[Sidebar] Starting recording indicator for conversation', recording.conversationId);
          this.recordingConversations.add(convId);
        }
      }
    });
  }

  get filteredConversations() {
    const ADMIN_ID = '1a44c91f-138e-4cf2-a5ef-915e5c882673';
    // Usual filter and sort
    let sorted = this.conversations
      .filter(c => (c.messages && c.messages.length > 0) || c.lastMessage)
      .sort((a, b) => {
        const aTime = a.lastMessage?.sentAt || a.lastMessageAt || '';
        const bTime = b.lastMessage?.sentAt || b.lastMessageAt || '';
        return bTime.localeCompare(aTime);
      });

    // Only pin for non-admins
    if (this.currentUserId && this.currentUserId !== ADMIN_ID) {
      const adminIdx = sorted.findIndex(c =>
        (c.user1Id === ADMIN_ID || c.user2Id === ADMIN_ID)
      );
      if (adminIdx > -1) {
        // Mark as pinned for template
        (sorted[adminIdx] as any).pinned = true;
        // Move to top
        const [adminConv] = sorted.splice(adminIdx, 1);
        sorted = [adminConv, ...sorted];
      }
    }
    return sorted;
  }

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
    if (!conv.messages || !this.currentUserId) return 0;
    // Only show unread count if this conversation is NOT currently open
    if (this.selectedConversationId && conv.conversationId.toString() === this.selectedConversationId) {
      return 0;
    }
    return conv.messages.filter(
      (m: ChatMessageDto) => !m.isRead && m.sender.userId !== this.currentUserId
    ).length;
  }

  loadMore() {
    this.loadMoreConversations.emit();
  }

  getOtherUserName(conv: ChatConversationDto): string {
    if (!this.currentUserId) return '';
    if (conv.user1Id === conv.user2Id) return conv.user1FullName; // self-chat
    return conv.user1Id === this.currentUserId ? conv.user2FullName : conv.user1FullName;
  }

  getOtherUserProfileImage(conv: ChatConversationDto): string | undefined {
    if (!this.currentUserId) return this.defaultProfileImageUrl;
    if (conv.user1Id === conv.user2Id) return conv.user1ProfileImageUrl || this.defaultProfileImageUrl; // self-chat
    return conv.user1Id === this.currentUserId ? (conv.user2ProfileImageUrl || this.defaultProfileImageUrl) : (conv.user1ProfileImageUrl || this.defaultProfileImageUrl);
  }

  isTyping(conv: ChatConversationDto): boolean {
    return this.typingConversations.has(conv.conversationId.toString());
  }

  isRecording(conv: ChatConversationDto): boolean {
    return this.recordingConversations.has(conv.conversationId.toString());
  }

  onScroll(event: any) {
    const element = event.target;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 5 && this.hasMoreConversations && !this.isLoadingConversations) {
      this.loadMoreConversations.emit();
    }
  }
}

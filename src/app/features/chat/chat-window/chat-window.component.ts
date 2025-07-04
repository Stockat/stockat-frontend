import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessageDto, UserChatInfoDto } from '../../../core/models/chatmodels/chat-models';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, AvatarModule, ButtonModule, BadgeModule],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnChanges, AfterViewInit, AfterViewChecked, OnInit, OnDestroy {
  @Input() messages: ChatMessageDto[] = [];
  @Input() currentUserId: string | null = null;
  @Input() isTyping: boolean = false;
  @Output() sendMessage = new EventEmitter<string>();
  @Output() reactToMessage = new EventEmitter<{ messageId: number, reaction: string }>();
  @Output() replyToMessage = new EventEmitter<{ messageId: number, content: string }>();
  @Output() deleteMessage = new EventEmitter<number>();
  @Input() conversationId: number | null = null;
  @Output() loadMoreMessages = new EventEmitter<void>();
  @Input() hasMoreMessages: boolean = true;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  quickEmojis = ['👍', '❤️', '😂'];
  allEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '👏', '😡'];
  showEmojiPickerFor: number | null = null;
  private shouldScroll = false;
  selectedMessageId: number | null = null;
  isRecording = false;
  private previousMessageCount = 0;

  // Pagination state
  currentPage = 1;
  pageSize = 20;
  isLoadingMessages = false;

  constructor(private cdr: ChangeDetectorRef, private chatService: ChatService) {}

  ngAfterViewInit() {
    this.shouldScroll = true;
    this.scrollToBottom();
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      this.scrollContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy() {
    if (this.scrollContainer && this.scrollContainer.nativeElement) {
      this.scrollContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentUserId']) {
      // console.log('ChatWindowComponent currentUserId:', this.currentUserId);
    }
    if (changes['messages']) {
      // Only scroll if a new message is added (not just a reaction)
      const newCount = this.messages.length;
      if (newCount > this.previousMessageCount) {
        this.shouldScroll = true;
      }
      this.previousMessageCount = newCount;
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnInit() {
    this.chatService.recording$.subscribe(event => {
      if (
        event &&
        event.conversationId === this.conversationId &&
        event.userId !== this.currentUserId
      ) {
        console.log('[ChatWindow] Set isRecording true for conversation', event.conversationId);
        this.isRecording = true;
        setTimeout(() => this.isRecording = false, 2000);
      }
    });
  }

  scrollToBottom() {
    try {
      if (this.scrollContainer && this.scrollContainer.nativeElement) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }

  isOwnMessage(message: ChatMessageDto): boolean {
    // console.log('Message sender:', message.sender);
    return message.sender?.userId === this.currentUserId;
  }

  openEmojiPicker(messageId: number) {
    this.showEmojiPickerFor = this.showEmojiPickerFor === messageId ? null : messageId;
  }
  closeEmojiPicker() {
    this.showEmojiPickerFor = null;
  }

  onMessageClick(msg: ChatMessageDto) {
    if (this.selectedMessageId === msg.messageId) {
      this.selectedMessageId = null;
    } else {
      this.selectedMessageId = msg.messageId;
    }
  }

  groupReactions(reactions: any[] = []): { reactionType: string, count: number, hasCurrentUser: boolean }[] {
    const map = new Map<string, { reactionType: string, count: number, hasCurrentUser: boolean }>();
    for (const r of reactions) {
      if (!map.has(r.reactionType)) {
        map.set(r.reactionType, { reactionType: r.reactionType, count: 0, hasCurrentUser: false });
      }
      const group = map.get(r.reactionType)!;
      group.count++;
      if (r.userId === this.currentUserId) group.hasCurrentUser = true;
    }
    return Array.from(map.values());
  }

  onScroll() {
    if (!this.hasMoreMessages || this.isLoadingMessages) return;
    const el = this.scrollContainer.nativeElement;
    if (el.scrollTop === 0) {
      this.onLoadMoreMessagesWithScrollLock();
    }
  }

  // Load more and maintain scroll position
  onLoadMoreMessagesWithScrollLock() {
    if (!this.hasMoreMessages || this.isLoadingMessages) return;
    const el = this.scrollContainer.nativeElement;
    const prevHeight = el.scrollHeight;
    this.isLoadingMessages = true;
    this.loadMoreMessages.emit();
    // Wait for parent to update messages, then adjust scroll
    setTimeout(() => {
      const newHeight = el.scrollHeight;
      el.scrollTop = newHeight - prevHeight;
      this.isLoadingMessages = false;
    }, 300); // Adjust timeout as needed for data load
  }

  // Call this from parent when new messages are prepended
  onMessagesPrepended(newMessages: ChatMessageDto[]) {
    this.isLoadingMessages = false;
    if (newMessages.length < this.pageSize) {
      this.hasMoreMessages = false;
    }
    // Optionally, maintain scroll position here
  }
}

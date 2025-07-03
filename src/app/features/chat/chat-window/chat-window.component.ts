import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, AfterViewChecked, OnInit } from '@angular/core';
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
export class ChatWindowComponent implements OnChanges, AfterViewInit, AfterViewChecked, OnInit {
  @Input() messages: ChatMessageDto[] = [];
  @Input() currentUserId: string | null = null;
  @Input() isTyping: boolean = false;
  @Output() sendMessage = new EventEmitter<string>();
  @Output() reactToMessage = new EventEmitter<{ messageId: number, reaction: string }>();
  @Output() replyToMessage = new EventEmitter<{ messageId: number, content: string }>();
  @Output() deleteMessage = new EventEmitter<number>();
  @Input() conversationId: number | null = null;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  quickEmojis = ['👍', '❤️', '😂'];
  allEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '👏', '😡'];
  showEmojiPickerFor: number | null = null;
  private shouldScroll = false;
  selectedMessageId: number | null = null;
  isRecording = false;

  constructor(private cdr: ChangeDetectorRef, private chatService: ChatService) {}

  ngAfterViewInit() {
    this.shouldScroll = true;
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentUserId']) {
      // console.log('ChatWindowComponent currentUserId:', this.currentUserId);
    }
    if (changes['messages']) {
      // console.log('ChatWindowComponent messages:', this.messages);
      this.shouldScroll = true;
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
    this.showEmojiPickerFor = messageId;
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
}

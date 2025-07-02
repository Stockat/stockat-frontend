import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessageDto, UserChatInfoDto } from '../../../core/models/chatmodels/chat-models';
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
export class ChatWindowComponent implements OnChanges, AfterViewInit, AfterViewChecked {
  @Input() messages: ChatMessageDto[] = [];
  @Input() currentUserId: string | null = null;
  @Input() isTyping: boolean = false;
  @Output() sendMessage = new EventEmitter<string>();
  @Output() reactToMessage = new EventEmitter<{ messageId: number, reaction: string }>();
  @Output() replyToMessage = new EventEmitter<{ messageId: number, content: string }>();
  @Output() deleteMessage = new EventEmitter<number>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  quickEmojis = ['👍', '❤️', '😂'];
  allEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '👏', '😡'];
  showEmojiPickerFor: number | null = null;
  private shouldScroll = false;
  selectedMessageId: number | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

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
}

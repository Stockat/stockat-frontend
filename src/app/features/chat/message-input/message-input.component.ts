import { Component, Output, EventEmitter, Input, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent implements OnChanges {
  message: string = '';
  @Output() send = new EventEmitter<string>();
  @Output() typing = new EventEmitter<void>();
  @Output() sendImage = new EventEmitter<{ file: File, messageText?: string }>();
  @Output() sendVoice = new EventEmitter<{ file: File, messageText?: string }>();
  error: string | null = null;
  isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  @Input() conversationId: number | null = null;
  @Input() focusTrigger: number = 0;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef<HTMLInputElement>;
  showImageConfirm = false;
  imagePreviewUrl: string | null = null;
  imageFile: File | null = null;

  showVoiceConfirm = false;
  voicePreviewUrl: string | null = null;
  voiceFile: File | null = null;

  ngOnChanges() {
    console.log('[MessageInput] conversationId changed to:', this.conversationId);
    this.message = '';
    // Focus the input when conversation changes
    setTimeout(() => this.focusInput(), 100);
  }

  constructor(private chatService: ChatService) {}

  focusInput() {
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  sendMessage() {
    if (!this.message.trim()) {
      this.error = 'Message is required.';
      return;
    }
    this.error = null;
    this.send.emit(this.message);
    this.message = '';
  }

  onInput() {
    this.typing.emit();
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imageFile = input.files[0];
      this.imagePreviewUrl = URL.createObjectURL(this.imageFile);
      this.showImageConfirm = true;
      input.value = '';
    }
  }

  confirmSendImage() {
    if (this.imageFile) {
      this.sendImage.emit({ file: this.imageFile, messageText: this.message || undefined });
    }
    this.cancelSendImage();
  }

  cancelSendImage() {
    this.showImageConfirm = false;
    this.imagePreviewUrl = null;
    this.imageFile = null;
  }

  onVoiceSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.voiceFile = input.files[0];
      this.voicePreviewUrl = URL.createObjectURL(this.voiceFile);
      this.showVoiceConfirm = true;
      input.value = '';
    }
  }

  confirmSendVoice() {
    if (this.voiceFile) {
      this.sendVoice.emit({ file: this.voiceFile, messageText: this.message || undefined });
    }
    this.cancelSendVoice();
  }

  cancelSendVoice() {
    this.showVoiceConfirm = false;
    this.voicePreviewUrl = null;
    this.voiceFile = null;
  }

  toggleRecording() {
    console.log('[MessageInput] toggleRecording called, isRecording:', this.isRecording);
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    console.log('[MessageInput] startRecording called');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Audio recording is not supported in this browser.');
      return;
    }
    
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.recordedChunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' });
        this.voiceFile = file;
        this.voicePreviewUrl = URL.createObjectURL(file);
        this.showVoiceConfirm = true;
        // Do not send yet, wait for user confirmation
      };
      this.mediaRecorder.start();
      this.isRecording = true;
      
      // Send recording notification AFTER recording actually starts
      if (this.conversationId) {
        console.log('[MessageInput] Sending recording notification for conversation:', this.conversationId);
        this.chatService.sendRecordingNotification(this.conversationId);
      }
    }).catch(() => {
      alert('Could not access microphone.');
    });
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      // Send recording stop notification
      if (this.conversationId) {
        console.log('[MessageInput] Stopping recording notification for conversation:', this.conversationId);
        // Send the same event but with a flag to indicate stop
        this.chatService.sendRecordingStopNotification(this.conversationId);
      }
    }
  }
}

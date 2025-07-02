import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.css']
})
export class MessageInputComponent {
  message: string = '';
  @Output() send = new EventEmitter<string>();
  @Output() typing = new EventEmitter<void>();
  @Output() sendImage = new EventEmitter<{ file: File, messageText?: string }>();
  @Output() sendVoice = new EventEmitter<{ file: File, messageText?: string }>();
  error: string | null = null;
  isRecording = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

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
      this.sendImage.emit({ file: input.files[0], messageText: this.message || undefined });
      this.message = '';
      input.value = '';
    }
  }

  onVoiceSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.sendVoice.emit({ file: input.files[0], messageText: this.message || undefined });
      this.message = '';
      input.value = '';
    }
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
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
        this.sendVoice.emit({ file, messageText: this.message || undefined });
        this.message = '';
      };
      this.mediaRecorder.start();
      this.isRecording = true;
    }).catch(() => {
      alert('Could not access microphone.');
    });
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }
}

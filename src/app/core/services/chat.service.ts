import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  UserChatInfoDto,
  SendMessageDto,
  SendImageMessageDto,
  SendVoiceMessageDto,
  ReactToMessageDto,
  MessageReactionDto,
  ChatMessageDto,
  ChatConversationDto
} from '../models/chatmodels/chat-models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private hubConnection: HubConnection | null = null;
  private baseUrl = 'http://localhost:5250/api/chat';

  // Observables for real-time updates
  private conversations$ = new BehaviorSubject<ChatConversationDto[]>([]);
  private messages$ = new BehaviorSubject<ChatMessageDto[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private messageSubject = new BehaviorSubject<ChatMessageDto | null>(null);
  public message$ = this.messageSubject.asObservable();
  private typingSubject = new BehaviorSubject<{ conversationId: string, userId: string } | null>(null);
  public typing$ = this.typingSubject.asObservable();

  constructor(private http: HttpClient) {}

  // REST API methods
  getConversations(page = 1, pageSize = 20): Observable<ChatConversationDto[]> {
    return this.http.get<ChatConversationDto[]>(`${this.baseUrl}/conversations?page=${page}&pageSize=${pageSize}`);
  }

  getMessages(conversationId: number, page = 1, pageSize = 30): Observable<ChatMessageDto[]> {
    return this.http.get<ChatMessageDto[]>(`${this.baseUrl}/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`);
  }

  sendTextMessage(dto: SendMessageDto): Observable<ChatMessageDto> {
    return this.http.post<ChatMessageDto>(`${this.baseUrl}/messages/text`, dto);
  }

  sendImageMessage(dto: SendImageMessageDto): Observable<ChatMessageDto> {
    const formData = new FormData();
    formData.append('ConversationId', dto.conversationId.toString());
    if (dto.messageText) formData.append('MessageText', dto.messageText);
    formData.append('Image', dto.image);
    return this.http.post<ChatMessageDto>(`${this.baseUrl}/messages/image`, formData);
  }

  sendVoiceMessage(dto: SendVoiceMessageDto): Observable<ChatMessageDto> {
    const formData = new FormData();
    formData.append('ConversationId', dto.conversationId.toString());
    if (dto.messageText) formData.append('MessageText', dto.messageText);
    formData.append('Voice', dto.voice);
    return this.http.post<ChatMessageDto>(`${this.baseUrl}/messages/voice`, formData);
  }

  reactToMessage(dto: ReactToMessageDto): Observable<MessageReactionDto> {
    return this.http.post<MessageReactionDto>(`${this.baseUrl}/messages/react`, dto);
  }

  markMessageAsRead(messageId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/messages/${messageId}/read`, {});
  }

  editMessage(messageId: number, newText: string): Observable<ChatMessageDto> {
    return this.http.put<ChatMessageDto>(`${this.baseUrl}/messages/${messageId}`, JSON.stringify(newText), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteMessage(messageId: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/messages/${messageId}`);
  }

  searchUsers(term: string): Observable<UserChatInfoDto[]> {
    return this.http.get<UserChatInfoDto[]>(`${this.baseUrl}/users/search?term=${encodeURIComponent(term)}`);
  }

  getUnreadMessageCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/notifications/unread-count`);
  }

  // SignalR real-time methods
  startConnection(token: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5250/chathub', { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();
    this.hubConnection.start().catch((err: any) => console.error('SignalR Connection Error:', err));
    this.registerSignalREvents();
  }

  stopConnection() {
    this.hubConnection?.stop();
    this.hubConnection = null;
  }

  joinConversation(conversationId: number) {
    this.hubConnection?.invoke('JoinConversation', conversationId)
      .catch((err: any) => console.error('SignalR JoinConversation Error:', err));
  }

  leaveConversation(conversationId: number) {
    this.hubConnection?.invoke('LeaveConversation', conversationId)
      .catch((err: any) => console.error('SignalR LeaveConversation Error:', err));
  }

  sendMessageSignalR(dto: SendMessageDto) {
    this.hubConnection?.invoke('SendMessage', dto)
      .catch((err: any) => console.error('SignalR SendMessage Error:', err));
  }

  sendImageMessageSignalR(dto: SendImageMessageDto, image: File) {
    // SignalR file upload requires special handling; usually use REST for files
  }

  sendVoiceMessageSignalR(dto: SendVoiceMessageDto, voice: File) {
    // SignalR file upload requires special handling; usually use REST for files
  }

  reactToMessageSignalR(dto: ReactToMessageDto) {
    this.hubConnection?.invoke('ReactToMessage', dto)
      .catch((err: any) => console.error('SignalR ReactToMessage Error:', err));
  }

  markMessageAsReadSignalR(messageId: number) {
    this.hubConnection?.invoke('MarkMessageAsRead', messageId)
      .catch((err: any) => console.error('SignalR MarkMessageAsRead Error:', err));
  }

  editMessageSignalR(messageId: number, newText: string) {
    this.hubConnection?.invoke('EditMessage', messageId, newText)
      .catch((err: any) => console.error('SignalR EditMessage Error:', err));
  }

  deleteMessageSignalR(messageId: number) {
    this.hubConnection?.invoke('DeleteMessage', messageId)
      .catch((err: any) => console.error('SignalR DeleteMessage Error:', err));
  }

  // SignalR event handlers
  private registerSignalREvents() {
    if (!this.hubConnection) return;
    this.hubConnection.on('ReceiveMessage', (message: ChatMessageDto) => {
      this.messageSubject.next(message);
      const current = this.messages$.getValue();
      this.messages$.next([...current, message]);
    });
    this.hubConnection.on('ReceiveReaction', (reaction: MessageReactionDto) => {
      const msgs = this.messages$.getValue().map(m => {
        if (m.messageId === reaction.messageId) {
          return { ...m, reactions: [...m.reactions, reaction] };
        }
        return m;
      });
      this.messages$.next(msgs);
    });
    this.hubConnection.on('MessageRead', (messageId: number, userId: string) => {
      // handle message read
    });
    this.hubConnection.on('MessageEdited', (message: ChatMessageDto) => {
      const msgs = this.messages$.getValue().map(m => m.messageId === message.messageId ? message : m);
      this.messages$.next(msgs);
    });
    this.hubConnection.on('MessageDeleted', (messageId: number) => {
      const msgs = this.messages$.getValue().filter(m => m.messageId !== messageId);
      this.messages$.next(msgs);
    });
    this.hubConnection.on('IncrementUnread', () => {
      this.unreadCount$.next(this.unreadCount$.getValue() + 1);
    });
    // Add more event handlers as needed
  }

  // Observables for components
  getConversations$() { return this.conversations$.asObservable(); }
  getMessages$() { return this.messages$.asObservable(); }
  getUnreadCount$() { return this.unreadCount$.asObservable(); }

  // Create a new conversation
  createConversation(user2Id: string): Observable<ChatConversationDto> {
    return this.http.post<ChatConversationDto>(`${this.baseUrl}/conversations`, { user2Id });
  }
}

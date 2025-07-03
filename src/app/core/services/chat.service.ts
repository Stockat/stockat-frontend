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
  public hubConnection: HubConnection | null = null;
  private baseUrl = 'http://localhost:5250/api/chat';

  // Observables for real-time updates
  private conversations$ = new BehaviorSubject<ChatConversationDto[]>([]);
  private messages$ = new BehaviorSubject<ChatMessageDto[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private messageSubject = new BehaviorSubject<ChatMessageDto | null>(null);
  public message$ = this.messageSubject.asObservable();
  private typingSubject = new BehaviorSubject<{ conversationId: number, userId: string } | null>(null);
  public typing$ = this.typingSubject.asObservable();
  private recordingSubject = new BehaviorSubject<{ conversationId: number, userId: string } | null>(null);
  public recording$ = this.recordingSubject.asObservable();
  
  // Track current conversation for typing events
  private currentConversationId: number = 0;

  constructor(private http: HttpClient) {}

  // Method to set current conversation context for typing events
  setCurrentConversation(conversationId: number) {
    this.currentConversationId = conversationId;
  }

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
    this.hubConnection.start()
      .then(() => console.log('SignalR connected!'))
      .catch((err: any) => console.error('SignalR Connection Error:', err));
    this.registerSignalREvents();
    
    // Handle connection state changes
    this.hubConnection.onclose((error) => {
      console.log('SignalR connection closed:', error);
    });
    
    this.hubConnection.onreconnecting((error) => {
      console.log('SignalR reconnecting:', error);
    });
    
    this.hubConnection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
    });
  }

  stopConnection() {
    this.hubConnection?.stop();
    this.hubConnection = null;
  }

  joinConversation(conversationId: number) {
    console.log('Joining SignalR group for conversation:', conversationId);
    this.hubConnection?.invoke('JoinConversation', conversationId)
      .then(() => console.log('Joined group:', conversationId))
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
    this.hubConnection?.invoke('SendImageMessage', dto, image)
      .catch((err: any) => console.error('SignalR SendImageMessage Error:', err));
  }

  sendVoiceMessageSignalR(dto: SendVoiceMessageDto, voice: File) {
    // SignalR file upload requires special handling; usually use REST for files
    this.hubConnection?.invoke('SendVoiceMessage', dto, voice)
      .catch((err: any) => console.error('SignalR SendVoiceMessage Error:', err));
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

  createConversationSignalR(user2Id: string) {
    this.hubConnection?.invoke('CreateConversation', user2Id)
      .catch((err: any) => console.error('SignalR CreateConversation Error:', err));
  }

  deleteConversationSignalR(conversationId: number) {
    this.hubConnection?.invoke('DeleteConversation', conversationId)
      .catch((err: any) => console.error('SignalR DeleteConversation Error:', err));
  }

  sendTypingNotification(conversationId: number) {
    this.hubConnection?.invoke('Typing', conversationId)
      .catch((err: any) => console.error('SignalR Typing Error:', err));
  }

  sendRecordingNotification(conversationId: number) {
    this.hubConnection?.invoke('Recording', conversationId)
      .catch(err => console.error('SignalR Recording Error:', err));
  }

  sendRecordingStopNotification(conversationId: number) {
    // For now, we'll use the same method but with a different parameter
    // The backend can distinguish by checking if the user is still recording
    this.hubConnection?.invoke('Recording', conversationId)
      .catch(err => console.error('SignalR Recording Error:', err));
  }



  // SignalR event handlers
  private registerSignalREvents() {
    if (!this.hubConnection) return;
    
    this.hubConnection.on('ReceiveMessage', (message: ChatMessageDto) => {
      console.log('Received real-time message:', message);
      this.messageSubject.next(message);
      const current = this.messages$.getValue();
      this.messages$.next([...current, message]);
    });

    this.hubConnection.on('ReceiveReaction', (reaction: MessageReactionDto) => {
      console.log('Received real-time reaction:', reaction);
      const msgs = this.messages$.getValue().map(m => {
        if (m.messageId === reaction.messageId) {
          return { ...m, reactions: [...m.reactions, reaction] };
        }
        return m;
      });
      this.messages$.next(msgs);
    });

    this.hubConnection.on('MessageRead', (messageId: number, userId: string, isRead: boolean, readAt: string | null) => {
      console.log('Received MessageRead event:', { messageId, userId, isRead, readAt });
      const msgs = this.messages$.getValue().map(m => {
        if (m.messageId === messageId) {
          return { ...m, isRead, readAt };
        }
        return m;
      });
      this.messages$.next(msgs);
    });

    this.hubConnection.on('MessageEdited', (message: ChatMessageDto) => {
      console.log('Received MessageEdited event:', message);
      const msgs = this.messages$.getValue().map(m => m.messageId === message.messageId ? message : m);
      this.messages$.next(msgs);
    });

    this.hubConnection.on('MessageDeleted', (messageId: number) => {
      console.log('Received MessageDeleted event:', messageId);
      const msgs = this.messages$.getValue().filter(m => m.messageId !== messageId);
      this.messages$.next(msgs);
    });

    this.hubConnection.on('IncrementUnread', () => {
      console.log('Received IncrementUnread event');
      this.unreadCount$.next(this.unreadCount$.getValue() + 1);
    });

    this.hubConnection.on('Typing', (conversationId: number, userId: string) => {
      console.log('Received Typing event:', { conversationId, userId });
      this.typingSubject.next({ conversationId, userId });
    });

    this.hubConnection.on('Recording', (conversationId: number, userId: string) => {
      console.log('[SignalR] Received Recording event:', { conversationId, userId });
      this.recordingSubject.next({ conversationId, userId });
    });



    this.hubConnection.on('ConversationCreated', (conversation: ChatConversationDto) => {
      console.log('Received ConversationCreated:', conversation);
      const current = this.conversations$.getValue();
      const exists = current.some(c => c.conversationId === conversation.conversationId);
      if (!exists) {
        console.log('Adding new conversation to sidebar:', conversation);
        this.conversations$.next([conversation, ...current]);
        this.joinConversation(conversation.conversationId);
      } else {
        console.log('Conversation already exists in sidebar:', conversation.conversationId);
      }
    });

    this.hubConnection.on('ConversationDeleted', (conversationId: number) => {
      console.log('Received ConversationDeleted event:', conversationId);
      const current = this.conversations$.getValue();
      this.conversations$.next(current.filter(c => c.conversationId !== conversationId));
    });

    this.hubConnection.on('Error', (error: string) => {
      console.error('SignalR Error:', error);
      // You can emit this to show error messages to the user
    });
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

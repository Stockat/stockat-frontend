import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChatBotRequestDto,
  ChatBotResponseDto,
  ChatBotHistoryResponseDto,
  ChatBotClearHistoryResponseDto,
  ChatBotMessageDto
} from '../models/chatbot-models';

@Injectable({
  providedIn: 'root'
})
export class ChatBotService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/api/chatbot`;

  constructor(private http: HttpClient) {}

  /**
   * Send a message to the chatbot and get AI response
   */
  askChatBot(request: ChatBotRequestDto): Observable<ChatBotResponseDto> {
    return this.http.post<ChatBotResponseDto>(`${this.baseUrl}/ask`, request);
  }

  /**
   * Get chat history for the current user
   */
  getChatHistory(limit: number = 50): Observable<ChatBotHistoryResponseDto> {
    return this.http.get<ChatBotHistoryResponseDto>(`${this.baseUrl}/history?limit=${limit}`);
  }

  /**
   * Clear chat history for the current user
   */
  clearChatHistory(): Observable<ChatBotClearHistoryResponseDto> {
    return this.http.delete<ChatBotClearHistoryResponseDto>(`${this.baseUrl}/history`);
  }

  /**
   * Convert ChatBotMessageDto to ChatBotMessage for component use
   */
  convertToChatBotMessage(dto: ChatBotMessageDto): any {
    return {
      content: dto.messageText,
      senderId: dto.senderId,
      timestamp: new Date(dto.sentAt),
      role: dto.role
    };
  }

  /**
   * Convert ChatBotMessage to ChatBotMessageDto for API calls
   */
  convertToChatBotMessageDto(message: any): ChatBotMessageDto {
    return {
      messageText: message.content,
      senderId: message.senderId,
      sentAt: message.timestamp.toISOString(),
      role: message.role
    };
  }
}

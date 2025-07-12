import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
   * Send a message to the chatbot and get AI response (OpenAI-powered)
   */
  askChatBot(request: ChatBotRequestDto): Observable<ChatBotResponseDto> {
    return this.http.post<ChatBotResponseDto>(`${this.baseUrl}/ask`, request)
      .pipe(
        catchError(error => {
          console.error('ChatBot API Error:', error);
          // Return a fallback response if OpenAI fails
          return throwError(() => new Error('Unable to get AI response. Please try again.'));
        })
      );
  }

  /**
   * Get chat history for the current user
   */
  getChatHistory(limit: number = 50): Observable<ChatBotHistoryResponseDto> {
    return this.http.get<ChatBotHistoryResponseDto>(`${this.baseUrl}/history?limit=${limit}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching chat history:', error);
          return throwError(() => new Error('Unable to load chat history.'));
        })
      );
  }

  /**
   * Clear chat history for the current user
   */
  clearChatHistory(): Observable<ChatBotClearHistoryResponseDto> {
    return this.http.delete<ChatBotClearHistoryResponseDto>(`${this.baseUrl}/history`)
      .pipe(
        catchError(error => {
          console.error('Error clearing chat history:', error);
          return throwError(() => new Error('Unable to clear chat history.'));
        })
      );
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

  /**
   * Check if OpenAI is available and working
   */
  isOpenAIAvailable(): Observable<boolean> {
    // Use a simple GET request to test connectivity instead of sending a message
    return this.http.get<any>(`${this.baseUrl}/test`).pipe(
      map(() => true),
      catchError(() => [false])
    );
  }

  /**
   * Test endpoint to check database status
   */
  testChatBot(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/test`)
      .pipe(
        catchError(error => {
          console.error('Error in test call:', error);
          return throwError(() => new Error('Test call failed.'));
        })
      );
  }
}

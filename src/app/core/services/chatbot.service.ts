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
    console.log('Making API call to get chat history with limit:', limit);
    return this.http.get<ChatBotHistoryResponseDto>(`${this.baseUrl}/history?limit=${limit}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching chat history:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url
          });
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
    console.log('Converting DTO to message:', dto);
    const result = {
      content: dto.messageText,
      senderId: dto.senderId,
      timestamp: new Date(dto.sentAt),
      role: dto.role
    };
    console.log('Converted result:', result);
    return result;
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
    console.log('Making test API call to check database status');
    return this.http.get<any>(`${this.baseUrl}/test`)
      .pipe(
        catchError(error => {
          console.error('Error in test call:', error);
          return throwError(() => new Error('Test call failed.'));
        })
      );
  }
}

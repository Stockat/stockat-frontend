// ChatBot Request DTO
export interface ChatBotRequestDto {
  message: string;
}

// ChatBot Response DTO
export interface ChatBotResponseDto {
  response: string;
  timestamp: string;
  userId: string;
}

// ChatBot Message DTO (for history)
export interface ChatBotMessageDto {
  messageText: string;
  role: string; // 'user' or 'assistant'
  senderId: string;
  sentAt: string; // ISO string
}

// ChatBot History Response DTO
export interface ChatBotHistoryResponseDto {
  messages: ChatBotMessageDto[];
  userId: string;
  totalMessages: number;
}

// ChatBot Clear History Response DTO
export interface ChatBotClearHistoryResponseDto {
  message: string;
  userId: string;
}

// ChatBot Message Interface (for component use)
export interface ChatBotMessage {
  content: string;
  senderId: string;
  timestamp: Date;
  role: 'user' | 'assistant';
}

// UserChatInfoDto: Minimal user info for chat display (id, name, image)
export interface UserChatInfoDto {
  userId: string;
  fullName: string;
  profileImageUrl: string;
}

// SendMessageDto: Send a text message
export interface SendMessageDto {
  conversationId: number;
  messageText?: string;
}

// SendImageMessageDto: Send an image message
export interface SendImageMessageDto {
  conversationId: number;
  messageText?: string;
  image: File;
}

// SendVoiceMessageDto: Send a voice message
export interface SendVoiceMessageDto {
  conversationId: number;
  messageText?: string;
  voice: File;
}

// ReactToMessageDto: React to a message
export interface ReactToMessageDto {
  messageId: number;
  reactionType: string;
}

// MessageReactionDto: Represents a reaction to a message
export interface MessageReactionDto {
  reactionId: number;
  messageId: number;
  userId: string;
  reactionType: string;
  createdAt: string; // ISO string
}

// ChatMessageDto: Represents a chat message, including sender info and reactions
export interface ChatMessageDto {
  messageId: number;
  conversationId: number;
  sender: UserChatInfoDto;
  messageText?: string;
  imageUrl?: string;
  voiceUrl?: string;
  isEdited: boolean;
  isRead: boolean;
  sentAt: string; // ISO string
  reactions: MessageReactionDto[];
}

// ChatConversationDto: Represents a chat conversation, including participants, messages, and the last message
export interface ChatConversationDto {
  conversationId: number;
  user1Id: string;
  user2Id: string;
  user1FullName: string;
  user2FullName: string;
  user1ProfileImageUrl?: string;
  user2ProfileImageUrl?: string;
  lastMessageAt?: string; // ISO string | null
  isActive: boolean;
  createdAt: string; // ISO string
  messages: ChatMessageDto[];
  lastMessage: ChatMessageDto;
}

// ChatReactionDto represents a reaction to a message
export interface ChatReactionDto {
  userId: string;
  type: string; // e.g., emoji or reaction type
}

// ChatFileDto for file/image/voice uploads
export interface ChatFileDto {
  url: string;
  type: 'image' | 'voice' | 'file';
  name: string;
  size: number;
}

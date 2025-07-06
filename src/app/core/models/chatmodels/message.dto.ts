export interface MessageDto {
  id: string;
  conversationId: string;
  sender: UserSummary;
  content: string;
  type: 'text' | 'image' | 'voice';
  createdAt: string;
  reactions: ReactionDto[];
  isOwn: boolean;
}

export interface ReactionDto {
  userId: string;
  type: string;
}

export interface SendMessageDto {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'voice';
}

export interface UserSummary {
  id: string;
  userName: string;
  profileImageUrl?: string;
}

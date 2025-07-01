import { MessageDto } from "./message.dto";

export interface ConversationDto {
  id: string;
  participants: UserSummary[];
  lastMessage: MessageDto | null;
  unreadCount: number;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  userName: string;
  profileImageUrl?: string;
}

export interface PunishmentReadDto {
  id: number;
  userId: string;
  type: string;
  reason: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  userName?: string;
  userEmail?: string;
} 
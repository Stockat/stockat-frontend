export interface CreatePunishmentDto {
  userId: string;
  type: string;
  reason: string;
  endDate?: Date;
} 
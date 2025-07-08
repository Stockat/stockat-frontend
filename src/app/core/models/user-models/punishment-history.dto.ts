export interface PunishmentHistoryDto {
  type: string;
  reason: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
} 
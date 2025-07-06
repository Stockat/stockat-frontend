import { PunishmentInfoDto } from './punishment-info.dto';
import { PunishmentHistoryDto } from './punishment-history.dto';
import { UserStatisticsDto } from './user-statistics.dto';
import { UserVerificationReadDto } from './user-verification-read.dto';

export interface UserReadDto {
  id: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  aboutMe?: string;
  profileImageUrl?: string;
  isApproved: boolean;
  isDeleted: boolean;
  needsVerification: boolean;
  roles: string[];
  
  // Admin-specific properties
  currentPunishment?: PunishmentInfoDto;
  punishmentHistory?: PunishmentHistoryDto[];
  statistics?: UserStatisticsDto;
  UserVerification?: UserVerificationReadDto;
} 
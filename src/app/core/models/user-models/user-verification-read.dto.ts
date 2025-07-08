export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface UserVerificationReadDto {
  userId: string;
  nationalId: string;
  imageURL: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt?: string;
  
  // Admin-specific properties
  userName?: string;
  userEmail?: string;
} 
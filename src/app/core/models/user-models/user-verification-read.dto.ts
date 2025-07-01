export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface UserVerificationReadDto {
  nationalId: string;
  imageURL: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt?: string;
} 
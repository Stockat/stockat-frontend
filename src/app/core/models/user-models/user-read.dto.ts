export interface UserReadDto {
  id: string;
  userName: string;
  email: string;
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
} 
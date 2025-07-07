export interface SearchUserDto {
  query: string;
}

export interface UserSummary {
  id: string;
  userName: string;
  profileImageUrl?: string;
}

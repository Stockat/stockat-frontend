export interface AuthResponseDto {
  token: TokenDto;
  isAuthSuccessful: boolean;
  isDeleted?: boolean;
  message?: string;
}

export interface TokenDto {
  accessToken: string;
  refreshToken: string;
}

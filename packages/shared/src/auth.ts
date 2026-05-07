export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface AuthResponseDto {
  accessToken: string;
}

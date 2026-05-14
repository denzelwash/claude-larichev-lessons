import { http } from '@/shared/api/http';
import type { AuthResponseDto, PublicUser } from '@/shared/types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export const loginApi = (dto: LoginDto) =>
  http.post<AuthResponseDto>('/auth/login', dto).then((r) => r.data);

export const registerApi = (dto: RegisterDto) =>
  http.post<AuthResponseDto>('/auth/register', dto).then((r) => r.data);

export const getMeApi = () =>
  http.get<PublicUser>('/auth/me').then((r) => r.data);

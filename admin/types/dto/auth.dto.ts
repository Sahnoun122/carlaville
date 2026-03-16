import { User } from '../user';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: User;
}

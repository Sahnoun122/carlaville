import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

export class LoginResponseDto {
  accessToken!: string;
  tokenType!: 'Bearer';
  expiresIn!: string;
  user!: AuthenticatedUser;
}

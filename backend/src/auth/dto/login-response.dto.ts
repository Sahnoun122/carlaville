import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

export class LoginUserDto implements AuthenticatedUser {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  roles!: AuthenticatedUser['roles'];
}

export class LoginResponseDto {
  accessToken!: string;
  tokenType!: 'Bearer';
  expiresIn!: string;
  user!: LoginUserDto;
}

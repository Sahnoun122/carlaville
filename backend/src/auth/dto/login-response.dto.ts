import { Role } from '../../common/enums/role.enum';

class LoginUserDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  roles!: Role[];
}

export class LoginResponseDto {
  accessToken!: string;
  tokenType!: 'Bearer';
  expiresIn!: string;
  user!: LoginUserDto;
}

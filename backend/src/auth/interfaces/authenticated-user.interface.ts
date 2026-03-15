import { Role } from '../../common/enums/role.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
}

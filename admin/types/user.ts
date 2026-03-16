import { Role } from './role.enum';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  name: string;
  phone?: string;
  active?: boolean;
}

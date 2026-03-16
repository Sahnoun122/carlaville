import { getAuthToken } from './auth';
import { User } from '@/types';
import { jwtDecode } from 'jwt-decode';
import { Role } from '@/types/role.enum';

export const getCurrentUser = async (): Promise<User> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Unauthorized');
  }

  const decoded: { sub: string; email: string; name: string; role: Role } =
    jwtDecode(token);

  return {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
  };
};

import api from '@/lib/api';
import { LoginDto, LoginResponseDto } from '@/types/dto/auth.dto';
import { User } from '@/types/user';

export const login = async (credentials: LoginDto): Promise<LoginResponseDto> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};

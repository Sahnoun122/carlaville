import { post, get, patch } from '@/lib/api';
import { User } from '@/types/user';
import { LoginDto, LoginResponseDto } from '@/types/dto/auth.dto';

const BASE_URL = '/auth';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export const authService = {
  /**
   * Logs in a user.
   * @param credentials - The user's login credentials.
   * @returns A promise that resolves to the login response, containing the access token.
   */
  login: (credentials: LoginDto): Promise<LoginResponseDto> =>
    post<LoginResponseDto>(`${BASE_URL}/login`, credentials),

  /**
   * Fetches the currently authenticated user's profile.
   * @returns A promise that resolves to the user object.
   */
  getMe: (): Promise<User> => get<User>(`${BASE_URL}/me`),

  /**
   * Updates authenticated user profile.
   */
  updateProfile: (payload: UpdateProfilePayload): Promise<User> =>
    patch<User>(`${BASE_URL}/profile`, payload),
};

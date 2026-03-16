import Cookies from 'js-cookie';

export const login = (token: string) => {
  // Set as httpOnly on the server if possible, otherwise secure client-side
  const isSecure = process.env.NODE_ENV === 'production';
  Cookies.set('token', token, { expires: 7, secure: isSecure, sameSite: 'strict' });
};

export const logout = () => {
  Cookies.remove('token');
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get('token');
};

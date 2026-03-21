import { del, get, patch, post } from '@/lib/api';
import { User } from '@/types';

export interface UserFormValues {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: User['role'];
}

interface UpdateUserPayload extends UserFormValues {
  id: string;
}

export const getUsers = async (params: { page: number; limit: number; q?: string }) => {
  return get<{ users: User[]; count: number }>('/admin/users', { params });
};

export const createUser = async (data: UserFormValues) => {
  const [firstName = '', ...lastNameParts] = data.name.trim().split(/\s+/);

  return post<User>('/admin/users', {
    firstName,
    lastName: lastNameParts.join(' ') || firstName,
    email: data.email,
    phone: data.phone ?? '',
    password: data.password,
    role: data.role,
  });
};

export const updateUser = async (data: UpdateUserPayload) => {
  const { id, name, email, phone, role, password } = data;
  const [firstName = '', ...lastNameParts] = name.trim().split(/\s+/);

  const payload: Record<string, unknown> = {
    firstName,
    lastName: lastNameParts.join(' ') || firstName,
    email,
    phone: phone ?? '',
    role,
  };

  if (password && password.trim().length > 0) {
    payload.password = password;
  }

  return patch<User>(`/admin/users/${id}`, payload);
};

export const deleteUser = async (id: string) => {
  return del(`/admin/users/${id}`);
};


'use server';

import { revalidatePath } from 'next/cache';
import api from '@/lib/api';
import { User } from '@/types';

export const updateUser = async (id: string, data: Partial<User>) => {
  try {
    const user = await api.patch(`/users/${id}`, data);
    revalidatePath('/admin/profile');
    return user;
  } catch {
    throw new Error('Failed to update user');
  }
};

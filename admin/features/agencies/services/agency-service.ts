import { del, get, patch, post } from '@/lib/api';
import { Agency } from '@/types';

export interface AgencyFormValues {
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const getAgencies = async (params: { page: number; limit: number; q?: string }) => {
  const response = await get<{ agencies: Agency[]; count: number }>('/admin/agencies', { params });
  return {
    ...response,
    agencies: response.agencies.map((agency) => ({
      ...agency,
      id: (agency as any).id || (agency as any)._id || '',
    })),
  };
};

export const createAgency = async (data: AgencyFormValues) => {
  return post<Agency>('/admin/agencies', data);
};

export const updateAgency = async (data: AgencyFormValues & { id: string }) => {
  const { id, ...payload } = data;
  return patch<Agency>(`/admin/agencies/${id}`, payload);
};

export const activateAgency = async (id: string) => {
  return patch<Agency>(`/admin/agencies/${id}/activate`, {});
};

export const deactivateAgency = async (id: string) => {
  return patch<Agency>(`/admin/agencies/${id}/deactivate`, {});
};

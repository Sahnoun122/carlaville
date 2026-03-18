import { del, get, patch, post } from '@/lib/api';
import { Blog } from '@/types';

export interface BlogFormValues {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  published: boolean;
}

interface UpdateBlogPayload extends BlogFormValues {
  id: string;
}

export const getBlogs = async (params: {
  page: number;
  limit: number;
  q?: string;
  published?: 'true' | 'false';
}) => {
  return get<{ blogs: Blog[]; count: number }>('/admin/blogs', { params });
};

export const getBlogById = async (id: string) => {
  return get<Blog>(`/admin/blogs/${id}`);
};

export const createBlog = async (data: BlogFormValues) => {
  const payload: BlogFormValues = {
    ...data,
    images: data.images?.filter((image) => image.trim().length > 0) ?? [],
  };

  return post<Blog>('/admin/blogs', payload);
};

export const updateBlog = async (data: UpdateBlogPayload) => {
  const { id, ...payload } = data;
  const normalizedPayload: BlogFormValues = {
    ...payload,
    images: payload.images?.filter((image) => image.trim().length > 0) ?? [],
  };

  return patch<Blog>(`/admin/blogs/${id}`, normalizedPayload);
};

export const deleteBlog = async (id: string) => {
  return del<{ message: string }>(`/admin/blogs/${id}`);
};

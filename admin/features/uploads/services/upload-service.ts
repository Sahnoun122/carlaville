import api from '@/lib/api';

interface UploadResponse {
  files: Array<{
    key: string;
    url: string;
    mimeType: string;
    size: number;
    originalName: string;
  }>;
}

export const uploadImages = async (files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post<UploadResponse>('/admin/uploads/images', formData);

  return response.data.files;
};

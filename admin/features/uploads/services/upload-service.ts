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

const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.82;

const replaceExtension = (name: string, extension: string) => {
  const parts = name.split('.');
  if (parts.length <= 1) {
    return `${name}.${extension}`;
  }

  parts.pop();
  return `${parts.join('.')}.${extension}`;
};

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to read image file.'));
    };

    image.src = objectUrl;
  });

const compressImageFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  if (file.size <= 900 * 1024) {
    return file;
  }

  try {
    const image = await loadImage(file);
    const maxDimension = Math.max(image.naturalWidth, image.naturalHeight);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / maxDimension);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    const outputMimeType = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputMimeType, IMAGE_QUALITY);
    });

    if (!blob) {
      return file;
    }

    const extension = outputMimeType === 'image/webp' ? 'webp' : 'jpg';
    return new File([blob], replaceExtension(file.name, extension), {
      type: outputMimeType,
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
};

export const uploadImages = async (files: File[]) => {
  const formData = new FormData();

  const preparedFiles = await Promise.all(files.map((file) => compressImageFile(file)));

  preparedFiles.forEach((file) => {
    formData.append('files', file, file.name);
  });

  const response = await api.post<UploadResponse>('/admin/uploads/images', formData);

  return response.data.files;
};

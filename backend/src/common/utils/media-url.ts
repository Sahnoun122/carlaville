const LOCAL_MEDIA_HOSTS = new Set(['127.0.0.1', 'localhost']);

export const getMediaBaseUrl = () => {
  const fallbackBaseUrl = process.env.MINIO_PUBLIC_BASE_URL || 'http://127.0.0.1:9000';

  try {
    return new URL(fallbackBaseUrl).origin;
  } catch {
    return fallbackBaseUrl.replace(/\/+$/, '');
  }
};

export const normalizeMediaUrl = (url?: string | null, baseUrl = getMediaBaseUrl()) => {
  const trimmedUrl = url?.trim();

  if (!trimmedUrl) {
    return '';
  }

  if (/^(data:|blob:)/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  try {
    const parsedUrl = new URL(trimmedUrl, baseUrl);

    if (!LOCAL_MEDIA_HOSTS.has(parsedUrl.hostname)) {
      return parsedUrl.toString();
    }

    const targetBaseUrl = new URL(baseUrl);
    parsedUrl.protocol = targetBaseUrl.protocol;
    parsedUrl.hostname = targetBaseUrl.hostname;
    parsedUrl.port = targetBaseUrl.port;
    parsedUrl.username = targetBaseUrl.username;
    parsedUrl.password = targetBaseUrl.password;

    return parsedUrl.toString();
  } catch {
    if (trimmedUrl.startsWith('/')) {
      return `${baseUrl.replace(/\/+$/, '')}${trimmedUrl}`;
    }

    return trimmedUrl;
  }
};

export const normalizeMediaUrls = (urls: string[] | undefined, baseUrl = getMediaBaseUrl()) =>
  (urls || [])
    .map((url) => normalizeMediaUrl(url, baseUrl))
    .filter((url) => url.length > 0);

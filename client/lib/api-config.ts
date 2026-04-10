const DEFAULT_API_URL = process.env.NODE_ENV === 'production'
	? 'https://carlaville-ykc8.vercel.app'
	: 'http://localhost:3009';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
export const API_BASE_URL = `${API_URL}/api`;

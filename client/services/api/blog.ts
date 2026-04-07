import { Blog, BlogResponse } from '@/types/blog';

import { API_BASE_URL } from '@/lib/api-config';

/**
 * Récupère la liste des blogs (limité aux blogs publiés par le backend public)
 */
export async function getBlogs(limit = 30): Promise<BlogResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs?limit=${limit}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`Erreur API getBlogs: ${res.status} ${res.statusText}`);
      return { blogs: [] };
    }

    const data = await res.json();
    return data as BlogResponse;
  } catch (error) {
    console.error('Erreur de requête getBlogs :', error);
    return { blogs: [] };
  }
}

/**
 * Récupère les détails d'un blog spécifique par son slug
 */
export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blogs/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status !== 404) {
        console.error(`Erreur API getBlogBySlug: ${res.status} ${res.statusText}`);
      }
      return null;
    }

    const data = await res.json();
    return data as Blog;
  } catch (error) {
    console.error('Erreur de requête getBlogBySlug :', error);
    return null;
  }
}

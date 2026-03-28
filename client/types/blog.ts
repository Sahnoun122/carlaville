export interface Blog {
  _id?: string;
  id?: string; // Sometimes APIs return id
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogResponse {
  blogs: Blog[];
  count?: number;
}

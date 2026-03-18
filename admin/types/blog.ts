export interface Blog {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  published: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

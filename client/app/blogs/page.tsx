import Link from 'next/link';
import { ChevronRight, Calendar, Bookmark } from 'lucide-react';

interface Blog {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  images?: string[];
  createdAt?: string;
}

async function getBlogs() {
  try {
    const res = await fetch('http://localhost:3009/api/blogs?limit=30', { next: { revalidate: 60 } });
    if (!res.ok) return { blogs: [] as Blog[] };
    return (await res.json()) as { blogs: Blog[] };
  } catch {
    return { blogs: [] as Blog[] };
  }
}

export default async function BlogsPage() {
  const data = await getBlogs();
  const blogs = data?.blogs || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
           <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog & Conseils</h1>
           <p className="text-gray-500 max-w-2xl mx-auto">Retrouvez toutes les actualités de Carlaville et nos conseils pour vos locations de voitures au Maroc.</p>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link key={blog._id} href={`/blogs/${blog.slug}`} className="bg-gray-50 rounded-2xl border border-gray-100 soft-shadow overflow-hidden group hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden bg-gray-50">
                  <img src={blog.coverImage || blog.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-3">
                     <Calendar className="w-3 h-3" />
                     {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Mars 2026'}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h2>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-6">{blog.excerpt}</p>
                  <div className="text-primary font-bold text-xs flex items-center gap-1 uppercase tracking-wider">
                     Tout lire <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-400">
             Aucun article disponible pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}


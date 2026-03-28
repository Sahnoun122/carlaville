import Link from 'next/link';
import { ChevronLeft, Calendar, Share2, Clock, Bookmark } from 'lucide-react';

interface Blog {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  createdAt?: string;
}

async function getBlog(slug: string) {
  try {
    const res = await fetch(`http://localhost:3009/api/blogs/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as Blog;
  } catch {
    return null;
  }
}

export default async function BlogDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) return <div className="py-40 text-center"><h1 className="text-2xl font-bold">Introuvable</h1></div>;

  const gallery = blog.images?.length ? blog.images : blog.coverImage ? [blog.coverImage] : [];

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary mb-8 px-4 py-2 bg-white rounded-xl">
           <ChevronLeft className="w-4 h-4" /> Retour aux articles
        </Link>

        <article className="space-y-8 animate-fade-in">
           <div className="space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 <span className="text-primary px-2 py-0.5 bg-red-50 rounded border border-red-100">Blog Carlaville</span>
                 <span className="flex items-center gap-1 border-l pl-4"><Calendar className="w-3 h-3" /> {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'Dernièrement'}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">{blog.title}</h1>
              <p className="text-lg text-gray-500 font-medium leading-relaxed italic">{blog.excerpt}</p>
           </div>

           {gallery.length > 0 && (
             <div className="rounded-2xl overflow-hidden border border-gray-100 soft-shadow h-[400px]">
                <img src={gallery[0]} className="w-full h-full object-cover" alt={blog.title} />
             </div>
           )}

           <div className="prose prose-neutral max-w-none text-gray-700 leading-loose text-lg whitespace-pre-line border-t pt-8">
              {blog.content}
           </div>

           {gallery.length > 1 && (
             <div className="grid grid-cols-2 gap-4 mt-8">
                {gallery.slice(1).map((img, i) => (
                  <img key={i} src={img} className="w-full h-64 rounded-xl object-cover border border-gray-100" />
                ))}
             </div>
           )}
           
           <div className="mt-16 p-8 bg-white rounded-2xl border border-gray-100 text-center space-y-4">
              <Bookmark className="w-10 h-10 text-gray-200 mx-auto" />
              <p className="text-sm font-bold text-gray-500 italic">Merci de lire Carlaville Blog. <br/>Suivez-nous pour plus de conseils mobilité au Maroc.</p>
           </div>
        </article>
      </div>
    </div>
  );
}

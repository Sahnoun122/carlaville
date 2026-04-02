import { Link } from '@/i18n/routing';
import { ChevronRight, Calendar, Bookmark } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import BlogCard from '@/components/BlogCard';

import { getBlogs } from '@/services/api/blog';

export async function generateMetadata() {
  const t = await getTranslations('blogs');
  return {
    title: t('title') + ' - CarLaville',
    description: t('subtitle'),
  };
}

export default async function BlogsPage() {
  const t = await getTranslations('blogs');
  const data = await getBlogs();
  const blogs = data?.blogs || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-geist">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-20 text-center space-y-6">
           <div className="inline-flex items-center gap-3 bg-red-50 px-4 py-1.5 rounded-2xl border border-red-100">
              <Bookmark className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Inspiration & Conseils</span>
           </div>
           <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">{t('title')}</h1>
           <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium tracking-tight leading-relaxed">{t('subtitle')}</p>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-fade-in mb-32">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} readMoreText={t('read_more')} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-400">
             {t('no_articles')}
          </div>
        )}
      </div>
    </div>
  );
}


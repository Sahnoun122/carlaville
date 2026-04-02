"use client";

import { Link } from '@/i18n/routing';
import { Calendar, Clock, ArrowRight, Bookmark } from 'lucide-react';
import { Blog } from '@/types/blog';
import { useMemo } from 'react';

interface BlogCardProps {
  blog: Blog;
  readMoreText: string;
}

export default function BlogCard({ blog, readMoreText }: BlogCardProps) {
  // Robust image selection & URL normalization
  const previewImage = useMemo(() => {
    const rawImg = blog.coverImage || blog.images?.[0];
    if (typeof rawImg !== 'string' || rawImg.trim().length === 0) return null;
    return rawImg.replace('127.0.0.1', 'localhost');
  }, [blog.coverImage, blog.images]);

  // Simulated reading time based on content length
  const readingTime = useMemo(() => {
    const words = blog.content?.split(/\s+/).length || 0;
    const minutes = Math.ceil(words / 200) || 1;
    return `${minutes} min read`;
  }, [blog.content]);

  const formattedDate = useMemo(() => {
    if (!blog.createdAt) return 'Mars 2026';
    return new Date(blog.createdAt).toLocaleDateString();
  }, [blog.createdAt]);

  return (
    <Link 
      href={`/blogs/${blog.slug}`} 
      className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden soft-shadow transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:-translate-y-2 flex flex-col h-full"
    >
      {/* Visual Header */}
      <div className="relative h-64 overflow-hidden bg-gray-50">
        {previewImage ? (
          <img 
            src={previewImage} 
            alt={blog.title} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
             <Bookmark className="w-12 h-12 text-slate-200 opacity-30" />
          </div>
        )}
        
        {/* Date Overlay (Glass) */}
        <div className="absolute top-4 left-4 glass px-4 py-2 rounded-2xl flex items-center gap-2">
           <Calendar className="w-3 h-3 text-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{formattedDate}</span>
        </div>

        {/* Reading Time Overlay */}
        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/20">
           <Clock className="w-3 h-3 text-white/80" />
           <span className="text-[9px] font-bold text-white uppercase tracking-wider">{readingTime}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-8 flex flex-col flex-1">
        <h2 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-primary transition-colors leading-tight line-clamp-2 font-geist">
          {blog.title}
        </h2>
        
        <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-3 mb-8 flex-1">
          {blog.excerpt}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
           <div className="flex items-center gap-2 group/btn">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{readMoreText}</span>
              <div className="w-8 h-8 rounded-full bg-red-50 text-primary flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-white group-hover:translate-x-1">
                 <ArrowRight className="w-4 h-4" />
              </div>
           </div>
           
           <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-white bg-red-600 ring-2 ring-gray-50" />
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-900 ring-2 ring-gray-50" />
           </div>
        </div>
      </div>
    </Link>
  );
}

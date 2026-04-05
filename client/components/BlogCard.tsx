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
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';
    const backendHost = new URL(API_URL).host;
    
    // If the image URL points to a local address, replace it with the current backend host
    return rawImg.replace('127.0.0.1:3009', backendHost).replace('localhost:3009', backendHost);
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
      className="group bg-white rounded-[3rem] overflow-hidden soft-shadow transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] hover:-translate-y-2 flex flex-col h-full border border-transparent hover:border-gray-100"
    >
      {/* Visual Header */}
      <div className="relative h-72 overflow-hidden bg-gray-50 m-2 rounded-[2.5rem]">
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
        
        {/* Date Overlay (Pill) */}
        <div className="absolute top-5 left-5 bg-white px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm">
           <Calendar className="w-4 h-4 text-primary fill-primary/10" />
           <span className="text-[11px] font-bold text-gray-900 tracking-tight">{formattedDate}</span>
        </div>

        {/* Reading Time Overlay (Glass Capsule) */}
        <div className="absolute bottom-5 right-5 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
           <Clock className="w-3.5 h-3.5 text-white/90" />
           <span className="text-[10px] font-bold text-white uppercase tracking-widest">{readingTime}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-10 pt-6 flex flex-col flex-1">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors leading-tight line-clamp-2">
          {blog.title}
        </h2>
        
        <p className="text-gray-400 text-[15px] font-medium leading-relaxed line-clamp-3 mb-8 flex-1">
          {blog.excerpt}
        </p>

        <div className="flex items-center justify-between pt-8 border-t border-gray-50/50">
           <div className="flex items-center gap-4 group/btn">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">{readMoreText}</span>
              <div className="w-11 h-11 rounded-full bg-primary/5 text-primary flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-white group-hover:translate-x-1">
                 <ArrowRight className="w-5 h-5" />
              </div>
           </div>
           
           <div className="flex -space-x-2.5">
              <div className="w-8 h-8 rounded-full border-[3px] border-white bg-primary shadow-sm" />
              <div className="w-8 h-8 rounded-full border-[3px] border-white bg-[#0f172a] shadow-sm" />
           </div>
        </div>
      </div>
    </Link>
  );
}

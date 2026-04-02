'use client';

import { Blog } from '@/types';
import { 
  Settings, 
  Trash2, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface AdminBlogCardProps {
  blog: Blog;
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
}

const normalizeUrl = (url: string) => url ? url.replace('127.0.0.1', 'localhost') : '';

export const AdminBlogCard = ({ blog, onEdit, onDelete }: AdminBlogCardProps) => {
  const blogId = blog.id || (blog as any)._id || '';
  
  const formattedDate = useMemo(() => {
    if (!blog.createdAt) return 'Date inconnue';
    return new Date(blog.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [blog.createdAt]);

  const previewImage = useMemo(() => {
    const rawImg = blog.coverImage || (blog.images && blog.images[0]);
    return normalizeUrl(rawImg || '');
  }, [blog.coverImage, blog.images]);

  return (
    <div className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full">
      {/* Visual Header */}
      <div className="relative aspect-video overflow-hidden bg-slate-50">
        {previewImage ? (
          <img 
            src={previewImage} 
            alt={blog.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
             <FileText size={48} className="opacity-20" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
           {blog.published ? (
             <span className="flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg shadow-green-500/20">
                <CheckCircle2 size={12} /> Publié
             </span>
           ) : (
             <span className="flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg shadow-amber-500/20">
                <AlertCircle size={12} /> Brouillon
             </span>
           )}
        </div>

        {/* Date Overlay */}
        <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10">
           <Calendar size={10} className="text-white/70" />
           <span className="text-[10px] font-bold text-white/90">{formattedDate}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 flex flex-col flex-1">
        <div className="flex-1">
           <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 font-geist leading-tight mb-2">
             {blog.title}
           </h3>
           <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed italic">
             {blog.excerpt || "Aucun résumé disponible."}
           </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                 <Link2 size={12} className="text-slate-400" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">/{blog.slug}</span>
           </div>

           <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(blog)}
                className="w-10 h-10 rounded-xl p-0 hover:bg-slate-900 hover:text-white transition-all border-slate-100"
              >
                 <Settings size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(blogId)}
                className="w-10 h-10 rounded-xl p-0 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm shadow-rose-100"
              >
                 <Trash2 size={16} />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Blog } from '@/types';
import { Edit2, Trash2, Eye, FileText, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BlogTableProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
}

const resolveBlogId = (blog: Blog) => blog.id || blog._id || '';

export const BlogTable = ({ blogs, onEdit, onDelete }: BlogTableProps) => {
  if (!blogs || blogs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
        <div className="text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <p className="font-medium italic">Aucun article de blog trouvé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="py-4 pl-6 font-semibold text-slate-900">Article</TableHead>
            <TableHead className="font-semibold text-slate-900">Date</TableHead>
            <TableHead className="font-semibold text-slate-900">Statut</TableHead>
            <TableHead className="text-right pr-6 font-semibold text-slate-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.map((blog) => {
            const blogId = resolveBlogId(blog);
            const previewImage = blog.coverImage || blog.images?.[0];

            return (
              <TableRow key={blogId} className="group transition-colors hover:bg-slate-50/50">
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-2 ring-white transition-all group-hover:ring-red-100">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt={blog.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <FileText size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col max-w-[300px]">
                      <span className="font-bold text-slate-900 truncate leading-tight">{blog.title}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5 truncate">{blog.excerpt}</span>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="text-sm font-medium text-slate-500 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : '-'}
                  </div>
                </TableCell>

                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-tight transition-all",
                      blog.published
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50'
                        : 'border-amber-200 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100/50'
                    )}
                  >
                    {blog.published ? (
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    ) : (
                      <AlertCircle size={12} className="text-amber-500" />
                    )}
                    {blog.published ? 'Publié' : 'Brouillon'}
                  </span>
                </TableCell>

                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2 items-center">
                    <Link href={`/admin/blogs/${blogId}`} passHref>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 w-9 p-0 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
                      >
                        <Eye size={14} className="text-slate-500" />
                        <span className="sr-only">Voir</span>
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(blog)} 
                      className="h-9 w-9 p-0 rounded-lg hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-all active:scale-95"
                    >
                      <Edit2 size={14} />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDelete(blogId)} 
                      className="h-9 w-9 p-0 rounded-lg hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-all active:scale-95 text-rose-500"
                    >
                      <Trash2 size={14} />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

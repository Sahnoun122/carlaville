'use client';

import { ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BlogFormValues,
  createBlog,
  deleteBlog,
  getBlogs,
  updateBlog,
} from '@/features/blogs/services/blog-service';
import { uploadImages } from '@/features/uploads/services/upload-service';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Blog } from '@/types';
import { 
  Plus, 
  Search, 
  RefreshCcw, 
  Trash2, 
  Loader2,
  FileText,
  ChevronRight,
  Filter,
  Image as ImageIcon,
  CheckCircle2,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminBlogCard } from './admin-blog-card';

const resolveBlogId = (blog: Blog) => blog.id || blog._id || '';
const normalizeUrl = (url: string) => url ? url.replace('127.0.0.1', 'localhost') : '';

const initialFormValues: BlogFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  images: [],
  published: true,
};

export const BlogManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [formValues, setFormValues] = useState<BlogFormValues>(initialFormValues);
  const [isUploading, setIsUploading] = useState(false);

  const blogsQuery = useQuery({
    queryKey: ['blogs', searchTerm, statusFilter],
    queryFn: () => getBlogs({ page: 1, limit: 50, q: searchTerm || undefined, published: statusFilter === 'all' ? undefined : statusFilter }),
  });

  const createMutation = useMutation({
    mutationFn: createBlog,
    onSuccess: () => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['blogs'] }); toast.success('Créé'); },
  });

  const updateMutation = useMutation({
    mutationFn: updateBlog,
    onSuccess: () => { setIsModalOpen(false); queryClient.invalidateQueries({ queryKey: ['blogs'] }); toast.success('Mis à jour'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['blogs'] }); toast.success('Supprimé'); },
  });

  const openCreateModal = () => { setSelectedBlog(null); setFormValues(initialFormValues); setIsModalOpen(true); };
  const openEditModal = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormValues({ title: blog.title || '', slug: blog.slug || '', excerpt: blog.excerpt || '', content: blog.content || '', coverImage: blog.coverImage || '', images: blog.images || (blog.coverImage ? [blog.coverImage] : []), published: blog.published });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setSelectedBlog(null); };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsUploading(true);
    try {
      const uploaded = await uploadImages(files);
      const urls = uploaded.map(f => f.url);
      setFormValues(prev => ({ ...prev, images: [...(prev.images || []), ...urls], coverImage: prev.coverImage || urls[0] || '' }));
    } finally { setIsUploading(false); }
  };

  const removeImage = (url: string) => {
    setFormValues(prev => ({ ...prev, images: (prev.images || []).filter(u => u !== url), coverImage: prev.coverImage === url ? (prev.images || []).filter(u => u !== url)[0] || '' : prev.coverImage }));
  };

  const handleSubmit = () => {
    // Basic presence validation
    if (!formValues.title || !formValues.content || !formValues.excerpt) {
      return toast.error('Veuillez remplir tous les champs (Titre, Résumé, Contenu)');
    }
    
    // Length validation to match backend DTOs
    if (formValues.title.trim().length < 5) {
      return toast.error('Le titre doit contenir au moins 5 caractères (Premium Standard)');
    }
    
    if (formValues.content.trim().length < 30) {
      return toast.error('Le contenu est trop court (min. 30 caractères requis)');
    }

    if (formValues.excerpt.trim().length > 300) {
      return toast.error('Le résumé est trop long (max. 300 caractères)');
    }

    if (selectedBlog) {
      return updateMutation.mutate({ id: resolveBlogId(selectedBlog), ...formValues });
    }
    createMutation.mutate(formValues);
  };

  const blogs = blogsQuery.data?.blogs ?? [];

  const labelClass = "text-sm font-semibold text-[#1E293B] mb-2";
  const inputClass = "h-12 bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-4 font-medium transition-all focus:bg-white focus:border-red-500 focus:ring-0 outline-none text-slate-800 placeholder:text-slate-400 text-base";

  return (
    <div className="w-full space-y-10 pb-20 text-left">
      {/* Editorial Header Card */}
      <div className="bg-white p-6 sm:p-8 lg:p-12 rounded-[24px] border border-slate-100 shadow-sm flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Espace Editorial</h1>
          <p className="text-slate-400 text-sm italic">Gérez vos articles, actulités et récits de voyage.</p>
        </div>
        <Button onClick={openCreateModal} className="h-14 w-full bg-red-600 text-white px-10 rounded-xl font-bold hover:bg-red-700 transition-colors sm:w-auto">
          <Plus size={20} className="mr-2" /> Créer un Article
        </Button>
      </div>

      {/* Modern Expense-style Control Bar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="relative lg:col-span-8">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <input 
             type="text" 
             placeholder="Rechercher par titre..." 
             value={searchTerm} 
             onChange={(e) => setSearchTerm(e.target.value)} 
             className={cn(inputClass, "w-full pl-12 h-12 shadow-sm")} 
           />
        </div>
        <div className="relative lg:col-span-3">
           <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
           <select 
             value={statusFilter} 
             onChange={(e) => setStatusFilter(e.target.value as 'all' | 'true' | 'false')} 
             className={cn(inputClass, "w-full pl-12 appearance-none shadow-sm")}
           >
             <option value="all">Tous les articles</option>
             <option value="true">Déjà publiés</option>
             <option value="false">En brouillon</option>
           </select>
        </div>
        <div className="lg:col-span-1">
          <Button variant="outline" onClick={() => blogsQuery.refetch()} className="w-full h-12 border-[#EDEFF2] rounded-lg hover:bg-slate-50 transition-colors">
            <RefreshCcw size={16} className={cn(blogsQuery.isRefetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {blogsQuery.isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[24px] border border-dashed border-slate-200">
           <Loader2 className="animate-spin text-red-500" size={40} />
           <p className="text-slate-400 text-sm mt-4 font-semibold">Analyse de la base de données...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {blogs.map(blog => <AdminBlogCard key={resolveBlogId(blog)} blog={blog} onEdit={openEditModal} onDelete={d => deleteMutation.mutate(resolveBlogId(blog))} />)}
        </div>
      )}

      {/* Simplified Modal (Expense Claim Style) */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedBlog ? 'Mettre à jour Article' : 'Nouveau Récit'} contentClassName="max-w-4xl p-0 overflow-hidden rounded-[20px] shadow-2xl border border-slate-100">
        <div className="flex flex-col h-full max-h-[88vh] bg-white text-left">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-14 space-y-10 sm:space-y-12 scrollbar-hide">
            
            <div className="space-y-4">
              <div className="w-14 h-14 bg-red-50 rounded-[14px] flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                 <FileText size={28} />
              </div>
              <div className="space-y-1">
                 <h2 className="text-3xl font-bold text-[#1E293B] tracking-tight">{selectedBlog ? 'Éditer l\'article' : 'Rédiger une histoire'}</h2>
                 <p className="text-slate-400 text-sm font-semibold italic">Partagez votre actualité avec la communauté Carlaville.</p>
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="space-y-6 pt-10 border-t border-slate-100">
               <div className="flex items-center justify-between">
                 <h3 className={labelClass}>Gestion des visuels</h3>
                 <span className="text-slate-400 text-xs italic font-medium uppercase tracking-wider">Asset Manager</span>
               </div>
               <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-6">
                 <label className="aspect-square bg-[#F8F9FA] border border-[#EDEFF2] rounded-[16px] flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 hover:border-red-200 transition-all group">
                   <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={isUploading} className="hidden" />
                   <ImageIcon size={24} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                   <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">Add Photo</span>
                 </label>
                 {(formValues.images || []).map((url, idx) => (
                   <div key={idx} className="relative aspect-square border border-slate-100 rounded-[16px] overflow-hidden group shadow-sm transition-transform hover:scale-105 duration-300">
                     <img src={normalizeUrl(url)} className="w-full h-full object-cover" alt="" />
                     <div className="absolute inset-0 bg-black/40 p-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => removeImage(url)} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-red-500 text-white flex items-center justify-center transition-colors"><Trash2 size={14} /></button>
                        <button onClick={() => setFormValues(p => ({...p, coverImage: url}))} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors ml-2", formValues.coverImage === url ? "bg-green-500 text-white" : "bg-white/20 text-white hover:bg-white/40")}><CheckCircle2 size={14} /></button>
                     </div>
                     {formValues.coverImage === url && <div className="absolute top-2 left-2 bg-red-600 text-[10px] font-bold text-white px-2.5 py-1 rounded-full uppercase shadow-lg border border-red-400">Couverture</div>}
                   </div>
                 ))}
               </div>
            </div>

            {/* Params Section */}
            <div className="space-y-8 pt-10 border-t border-slate-100">
               <h3 className={labelClass}>Configuration Editorial</h3>
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                 <div className="space-y-1.5"><p className={labelClass}>Titre de l'article</p><input value={formValues.title} onChange={e => setFormValues(p => ({ ...p, title: e.target.value }))} className={cn(inputClass, "w-full")} placeholder="For example: Client meeting lunch" /></div>
                 <div className="space-y-1.5"><p className={labelClass}>Slug (URL permaliens)</p><input value={formValues.slug} onChange={e => setFormValues(p => ({ ...p, slug: e.target.value }))} className={cn(inputClass, "w-full text-red-700")} placeholder="ex: mon-bel-article" /></div>
                 <div className="space-y-1.5"><p className={labelClass}>Statut de publication</p><select value={formValues.published ? 'true' : 'false'} onChange={e => setFormValues(p => ({ ...p, published: e.target.value === 'true' }))} className={cn(inputClass, "w-full appearance-none")}>
                   <option value="true">Publié (En ligne)</option>
                   <option value="false">En brouillon (Privé)</option>
                 </select></div>
                 <div className="space-y-1.5"><p className={labelClass}>Résumé (Accroche)</p><textarea value={formValues.excerpt} onChange={e => setFormValues(p => ({ ...p, excerpt: e.target.value }))} className={cn(inputClass, "w-full h-24 py-4 resize-none")} placeholder="Add any context for the app-user..." /></div>
               </div>
            </div>

            {/* Full Editor Section */}
            <div className="space-y-6 pt-10 border-t border-slate-100 pb-10">
               <h3 className={labelClass}>Corps de l'histoire</h3>
              <textarea 
                 value={formValues.content} 
                 onChange={e => setFormValues(p => ({ ...p, content: e.target.value }))} 
                className="w-full min-h-[320px] sm:min-h-[380px] lg:min-h-[450px] border border-[#EDEFF2] bg-[#F8F9FA] rounded-[18px] p-6 sm:p-8 lg:p-10 outline-none text-lg leading-relaxed font-medium focus:bg-white focus:border-red-500 transition-all duration-300 placeholder:text-slate-300" 
                 placeholder="Rédigez votre histoire ici (compatible Markdown)..." 
               />
            </div>
          </div>

          {/* Triple Action Footer (Expense Claim Style) */}
           <div className="flex flex-col gap-4 border-t border-slate-100 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-8">
             <button type="button" onClick={closeModal} className="text-slate-500 text-sm font-semibold hover:text-slate-700 transition-colors self-start">Annuler</button>
             <div className="flex w-full gap-4 sm:w-auto">

               <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending || isUploading} className="bg-red-600 text-white hover:bg-red-700 h-13 w-full px-12 rounded-lg font-bold transition-colors flex items-center gap-2 sm:w-auto">
                  {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin" /> : <>Soumettre <Check size={18} /></>}
                </Button>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

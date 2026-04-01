'use client';

import { ChangeEvent, useMemo, useState } from 'react';
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
import { BlogTable } from './blog-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Blog } from '@/types';
import { Plus, Search, FileText, RefreshCcw, Filter, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const resolveBlogId = (blog: Blog) => blog.id || blog._id || '';

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const blogsQuery = useQuery({
    queryKey: ['blogs', searchTerm, statusFilter],
    queryFn: () =>
      getBlogs({
        page: 1,
        limit: 50,
        q: searchTerm || undefined,
        published: statusFilter === 'all' ? undefined : statusFilter,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      setIsModalOpen(false);
      setFormValues(initialFormValues);
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Article de blog créé');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Échec de la création du blog.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBlog,
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedBlog(null);
      setFormValues(initialFormValues);
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Article de blog mis à jour');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Échec de la mise à jour.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Article de blog supprimé');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Échec de la suppression.');
    },
  });

  const openCreateModal = () => {
    setSelectedBlog(null);
    setUploadError(null);
    setFormValues(initialFormValues);
    setIsModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setSelectedBlog(blog);
    setUploadError(null);
    setFormValues({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      coverImage: blog.coverImage || '',
      images: blog.images || (blog.coverImage ? [blog.coverImage] : []),
      published: blog.published,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (createMutation.isPending || updateMutation.isPending) return;
    setIsModalOpen(false);
    setSelectedBlog(null);
    setFormValues(initialFormValues);
    setUploadError(null);
  };

  const handleImagesUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) return;
    setUploadError(null);
    setIsUploadingImages(true);

    try {
      const uploaded = await uploadImages(selectedFiles);
      const uploadedUrls = uploaded.map((file) => file.url);
      setFormValues((previous) => {
        const existingImages = previous.images || [];
        const mergedImages = [...existingImages, ...uploadedUrls];
        const coverImage = previous.coverImage || mergedImages[0] || '';
        return { ...previous, images: mergedImages, coverImage };
      });
      toast.success('Images téléchargées avec succès');
    } catch (error: any) {
      setUploadError(error.message || "Échec du téléchargement.");
      toast.error("Erreur d'upload");
    } finally {
      setIsUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet article ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = () => {
    if (!formValues.title || !formValues.content) {
      toast.error('Titre et contenu obligatoires');
      return;
    }
    if (selectedBlog) {
      updateMutation.mutate({ id: resolveBlogId(selectedBlog), ...formValues });
      return;
    }
    createMutation.mutate(formValues);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploadingImages;
  const blogs = blogsQuery.data?.blogs ?? [];

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Gestion du Blog
          </h1>
          <p className="mt-2 text-slate-500">
            Publiez des actualités, des conseils et des mises à jour pour vos clients.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="h-12 gap-2 bg-slate-900 px-6 font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Nouvel article
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Search Bar */}
        <div className="md:col-span-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
            <input
              type="text"
              placeholder="Rechercher par titre ou contenu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 shadow-sm transition-all focus:border-red-200 focus:outline-none focus:ring-4 focus:ring-red-50"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'true' | 'false')}
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 shadow-sm transition-all focus:border-red-200 focus:outline-none focus:ring-4 focus:ring-red-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xlmns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M7%207l3%203%203-3%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat font-medium"
          >
            <option value="all">Tous les articles</option>
            <option value="true">Publiés uniquement</option>
            <option value="false">Brouillons uniquement</option>
          </select>
        </div>

        {/* Refresh */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Articles</p>
              <p className="text-lg font-black text-slate-900 leading-none">{blogsQuery.data?.count || 0}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => blogsQuery.refetch()}
            disabled={blogsQuery.isLoading || blogsQuery.isRefetching}
            className="h-10 w-10 rounded-xl p-0 hover:bg-slate-50"
          >
            <RefreshCcw size={16} className={cn(blogsQuery.isRefetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {blogsQuery.isLoading && !blogsQuery.isRefetching ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/30">
          <div className="flex flex-col items-center gap-2">
            <RefreshCcw className="h-8 w-8 animate-spin text-slate-300" />
            <p className="text-sm font-bold text-slate-400">Récupération des articles...</p>
          </div>
        </div>
      ) : blogsQuery.isError ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-rose-100 bg-rose-50/50 text-center p-6">
          <p className="text-rose-900 font-bold">Impossible de charger le blog.</p>
          <Button onClick={() => blogsQuery.refetch()} variant="outline" className="mt-4 border-rose-200 text-rose-700 bg-white hover:bg-rose-50 font-bold">
            Réessayer
          </Button>
        </div>
      ) : (
        <BlogTable
          blogs={blogs}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedBlog ? 'Modifier l\'article' : 'Créer un article'}
        contentClassName="max-w-4xl rounded-[2.5rem]"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-h-[70vh] overflow-y-auto p-4 scrollbar-thin">
          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Contenu Principal</h3>
             <div>
               <label className="text-xs font-bold text-slate-500 mb-1 block ml-1">Titre de l'article</label>
               <input
                 type="text"
                 placeholder="Ex. 5 conseils pour louer au Maroc"
                 value={formValues.title}
                 onChange={(e) => setFormValues(p => ({ ...p, title: e.target.value }))}
                 className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-bold text-slate-900"
               />
             </div>
             <div>
               <label className="text-xs font-bold text-slate-500 mb-1 block ml-1">Slug (URL)</label>
               <input
                 type="text"
                 placeholder="ex-5-conseils"
                 value={formValues.slug}
                 onChange={(e) => setFormValues(p => ({ ...p, slug: e.target.value }))}
                 className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-400 font-medium text-slate-600"
               />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block ml-1">Résumé court</label>
                <textarea
                  placeholder="Un bref aperçu pour la liste..."
                  value={formValues.excerpt}
                  onChange={(e) => setFormValues(p => ({ ...p, excerpt: e.target.value }))}
                  rows={3}
                  className="w-full p-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-medium text-slate-700"
                />
             </div>
          </div>

          <div className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Médias & Paramètres</h3>
             <div className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-200 transition-all hover:bg-slate-100/50 group relative overflow-hidden">
                {formValues.coverImage ? (
                  <img src={formValues.coverImage} className="absolute inset-0 h-full w-full object-cover opacity-20" alt="Preview"/>
                ) : null}
                <div className="relative z-10 flex flex-col items-center">
                  <ImageIcon size={32} className="text-slate-300 mb-2 group-hover:text-red-400 transition-colors" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Image de couverture</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagesUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isUploadingImages}
                  />
                </div>
             </div>

             <div>
               <label className="text-xs font-bold text-slate-500 mb-1 block ml-1">Statut de publication</label>
               <select
                 value={formValues.published ? 'true' : 'false'}
                 onChange={(e) => setFormValues(p => ({ ...p, published: e.target.value === 'true' }))}
                 className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-bold text-slate-900 appearance-none"
               >
                 <option value="true">Publié (En ligne)</option>
                 <option value="false">Brouillon (Interne)</option>
               </select>
             </div>
          </div>

          <div className="md:col-span-2 pt-4">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Corps de l'article</h3>
             <textarea
               placeholder="Contenu complet ici..."
               value={formValues.content}
               onChange={(e) => setFormValues(p => ({ ...p, content: e.target.value }))}
               rows={12}
               className="w-full p-6 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-red-500 font-medium text-slate-800 leading-relaxed"
             />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 p-6 bg-slate-50/50 border-t border-slate-100">
          <Button variant="outline" onClick={closeModal} className="h-12 px-8 rounded-xl font-bold border-none hover:bg-slate-100 transition-all">
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="h-12 px-10 rounded-xl bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 text-white font-black transition-all active:scale-95"
          >
            {selectedBlog ? 'Mettre à jour l\'article' : 'Publier l\'article'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

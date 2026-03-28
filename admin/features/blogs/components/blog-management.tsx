'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/shared/page-header';
import { Blog } from '@/types';
import {
  BlogFormValues,
  createBlog,
  deleteBlog,
  getBlogs,
  updateBlog,
} from '@/features/blogs/services/blog-service';
import { uploadImages } from '@/features/uploads/services/upload-service';

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
  const [submitError, setSubmitError] = useState<string | null>(null);
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
      setSubmitError(null);
      setIsModalOpen(false);
      setFormValues(initialFormValues);
      setSearchTerm('');
      setStatusFilter('all');
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Échec de la création du blog.';

      setSubmitError(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBlog,
    onSuccess: () => {
      setSubmitError(null);
      setIsModalOpen(false);
      setSelectedBlog(null);
      setFormValues(initialFormValues);
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Échec de la mise à jour du blog.';

      setSubmitError(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });

  const openCreateModal = () => {
    setSelectedBlog(null);
    setSubmitError(null);
    setUploadError(null);
    setFormValues(initialFormValues);
    setIsModalOpen(true);
    // Clear search values to prevent them from interfering
    setSearchTerm('');
    setStatusFilter('all');
  };

  const openEditModal = (blog: Blog) => {
    setSelectedBlog(blog);
    setSubmitError(null);
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
    if (createMutation.isPending || updateMutation.isPending) {
      return;
    }

    setIsModalOpen(false);
    setSelectedBlog(null);
    setFormValues(initialFormValues);
    setUploadError(null);
  };

  const handleImagesUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setUploadError(null);
    setIsUploadingImages(true);

    try {
      const uploaded = await uploadImages(selectedFiles);
      const uploadedUrls = uploaded.map((file) => file.url);

      setFormValues((previous) => {
        const existingImages = previous.images || [];
        const mergedImages = [...existingImages, ...uploadedUrls];
        const coverImage = previous.coverImage || mergedImages[0] || '';

        return {
          ...previous,
          images: mergedImages,
          coverImage,
        };
      });
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : "Échec du téléchargement de l'image.";

      setUploadError(message);
    } finally {
      setIsUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleSubmit = () => {
    if (!formValues.title || !formValues.excerpt || !formValues.content) {
      setSubmitError('Veuillez remplir le titre, le résumé et le contenu.');
      return;
    }

    if (selectedBlog) {
      const blogId = resolveBlogId(selectedBlog);
      updateMutation.mutate({
        id: blogId,
        ...formValues,
      });
      return;
    }

    createMutation.mutate(formValues);
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || isUploadingImages;

  const blogs = useMemo(() => blogsQuery.data?.blogs ?? [], [blogsQuery.data?.blogs]);

  const randomIdSuffix = useMemo(() => Math.random().toString(36).substring(7), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion du Blog" description="Créez, éditez et publiez du contenu pour le blog.">
        <Button onClick={openCreateModal}>Ajouter un Blog</Button>
      </PageHeader>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Recherche</label>
              <input
                type="search"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Titre ou résumé"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Statut</label>
              <select
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as 'all' | 'true' | 'false')
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="all">Tous</option>
                <option value="true">Publié</option>
                <option value="false">Brouillon</option>
              </select>
            </div>
          </div>
      </div>

      {blogsQuery.isLoading && <p className="text-sm text-slate-600">Chargement des blogs...</p>}
      {blogsQuery.isError && <p className="text-sm text-rose-600">Erreur de chargement des blogs.</p>}

      {blogsQuery.data && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {blogs.map((blog) => {
            const blogId = resolveBlogId(blog);
            const previewImage =
              typeof blog.coverImage === 'string' && /^(https?:\/\/|\/)/i.test(blog.coverImage)
                ? blog.coverImage
                : blog.images?.[0];

            return (
              <article
                key={blogId}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={blog.title}
                    className="mb-4 h-44 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-44 w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                    Aucune image
                  </div>
                )}

                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      blog.published
                        ? 'border border-emerald-200 bg-emerald-100 text-emerald-800'
                        : 'border border-amber-200 bg-amber-100 text-amber-800'
                    }`}
                  >
                    {blog.published ? 'Publié' : 'Brouillon'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>

                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-slate-800">
                  {blog.title}
                </h3>
                <p className="mb-4 line-clamp-3 text-sm text-slate-600">{blog.excerpt}</p>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/blogs/${blogId}`}>
                    <Button size="sm" variant="outline">Voir les Détails</Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => openEditModal(blog)}>
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(blogId)}
                    disabled={deleteMutation.isPending}
                  >
                    Supprimer
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedBlog ? 'Modifier le Blog' : 'Ajouter un Blog'}
        contentClassName="max-w-3xl"
      >
        {submitError && <p className="mb-3 text-sm text-rose-600">{submitError}</p>}
        {uploadError && <p className="mb-3 text-sm text-rose-600">{uploadError}</p>}
        <div className="grid max-h-[70vh] grid-cols-1 gap-5 overflow-y-auto p-1">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Titre <span className="text-red-500">*</span></label>
            <input
              type="text"
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              placeholder="Ex. 5 conseils pour louer au Maroc"
              value={formValues.title}
              onChange={(event) =>
                setFormValues((previous) => ({ ...previous, title: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Slug (optionnel)</label>
              <input
                type="text"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                placeholder="ex-5-conseils"
                value={formValues.slug}
                onChange={(event) =>
                  setFormValues((previous) => ({ ...previous, slug: event.target.value }))
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Statut <span className="text-red-500">*</span></label>
              <select
                value={formValues.published ? 'true' : 'false'}
                onChange={(event) =>
                  setFormValues((previous) => ({ ...previous, published: event.target.value === 'true' }))
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="true">Publié (Visible)</option>
                <option value="false">Brouillon (Caché)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesUpload}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <p className="mt-1 text-xs text-slate-500">
              Téléchargez une ou plusieurs photos. La première image est utilisée comme couverture.
            </p>
            {(formValues.images?.length ?? 0) > 0 ? (
              <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-medium text-slate-700">Images téléchargées</p>
                <div className="space-y-1">
                  {(formValues.images || []).map((imageUrl) => (
                    <div key={imageUrl} className="text-xs text-slate-600 break-all">
                      {imageUrl}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Résumé court <span className="text-red-500">*</span></label>
            <textarea
              placeholder="Texte introductif ou aperçu..."
              value={formValues.excerpt}
              onChange={(event) =>
                setFormValues((previous) => ({ ...previous, excerpt: event.target.value }))
              }
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Contenu <span className="text-red-500">*</span></label>
            <textarea
              placeholder="Contenu complet du blog..."
              value={formValues.content}
              onChange={(event) =>
                setFormValues((previous) => ({ ...previous, content: event.target.value }))
              }
              rows={10}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {selectedBlog ? 'Enregistrer les Modifications' : 'Créer le Blog'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

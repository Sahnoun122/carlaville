'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
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
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to create blog.';

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
          : 'Failed to update blog.';

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
          : 'Image upload failed.';

      setUploadError(message);
    } finally {
      setIsUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleSubmit = () => {
    if (!formValues.title || !formValues.excerpt || !formValues.content) {
      setSubmitError('Please fill in title, excerpt and content.');
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

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Search</label>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Title or excerpt"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as 'all' | 'true' | 'false')
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="all">All</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>
          <Button className="shadow-sm" onClick={openCreateModal}>
            Add Blog
          </Button>
        </div>
      </div>

      {blogsQuery.isLoading && <p className="text-sm text-slate-600">Loading blogs...</p>}
      {blogsQuery.isError && <p className="text-sm text-rose-600">Error loading blogs.</p>}

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
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={blog.title}
                    className="mb-4 h-44 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-44 w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                    No image
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
                    {blog.published ? 'Published' : 'Draft'}
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
                    <Button size="sm" variant="outline">View Details</Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => openEditModal(blog)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(blogId)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
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
        title={selectedBlog ? 'Edit Blog' : 'Add Blog'}
        contentClassName="max-w-3xl"
      >
        {submitError && <p className="mb-3 text-sm text-rose-600">{submitError}</p>}
        {uploadError && <p className="mb-3 text-sm text-rose-600">{uploadError}</p>}
        <div className="grid max-h-[70vh] grid-cols-1 gap-3 overflow-y-auto pr-1">
          <input
            placeholder="Title"
            value={formValues.title}
            onChange={(event) =>
              setFormValues((previous) => ({ ...previous, title: event.target.value }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <input
            placeholder="Slug (optional)"
            value={formValues.slug}
            onChange={(event) =>
              setFormValues((previous) => ({ ...previous, slug: event.target.value }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <input
            placeholder="Cover image URL (optional)"
            value={formValues.coverImage}
            onChange={(event) =>
              setFormValues((previous) => ({ ...previous, coverImage: event.target.value }))
            }
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesUpload}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            disabled={isUploadingImages}
          />
          <p className="text-xs text-slate-500">
            Upload one or multiple photos. The first uploaded image is used as cover if cover is empty.
          </p>
          {(formValues.images?.length ?? 0) > 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-medium text-slate-700">Uploaded images</p>
              <div className="space-y-1">
                {(formValues.images || []).map((imageUrl) => (
                  <div key={imageUrl} className="text-xs text-slate-600 break-all">
                    {imageUrl}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <textarea
            placeholder="Short excerpt"
            value={formValues.excerpt}
            onChange={(event) =>
              setFormValues((previous) => ({ ...previous, excerpt: event.target.value }))
            }
            rows={3}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <textarea
            placeholder="Blog content"
            value={formValues.content}
            onChange={(event) =>
              setFormValues((previous) => ({ ...previous, content: event.target.value }))
            }
            rows={10}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          />

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={formValues.published}
              onChange={(event) =>
                setFormValues((previous) => ({ ...previous, published: event.target.checked }))
              }
            />
            Publish immediately
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {selectedBlog ? 'Save Changes' : 'Create Blog'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { getBlogById } from '@/features/blogs/services/blog-service';

const BlogDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const blogId = useMemo(() => (params?.id ? String(params.id) : ''), [params?.id]);

  const blogQuery = useQuery({
    queryKey: ['blog', blogId],
    queryFn: () => getBlogById(blogId),
    enabled: blogId.length > 0,
  });

  const blog = blogQuery.data;

  return (
    <div>
      <PageHeader title="Blog Details">
        <Link href="/admin/blogs">
          <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Back to Blogs
          </button>
        </Link>
      </PageHeader>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {blogQuery.isLoading && <p className="text-sm text-slate-600">Loading blog details...</p>}
        {blogQuery.isError && <p className="text-sm text-rose-600">Unable to load blog details.</p>}

        {blog ? (
          <article className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{blog.title}</h2>
                <p className="mt-1 text-sm text-slate-500">Slug: {blog.slug}</p>
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  blog.published
                    ? 'border border-emerald-200 bg-emerald-100 text-emerald-800'
                    : 'border border-amber-200 bg-amber-100 text-amber-800'
                }`}
              >
                {blog.published ? 'Published' : 'Draft'}
              </span>
            </div>

            <p className="text-slate-600">{blog.excerpt}</p>

            {(blog.images?.length || blog.coverImage) ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(blog.images?.length ? blog.images : [blog.coverImage]).filter(Boolean).map((imageUrl) => (
                  <img
                    key={imageUrl}
                    src={imageUrl as string}
                    alt={blog.title}
                    className="h-56 w-full rounded-lg border border-slate-200 object-cover"
                  />
                ))}
              </div>
            ) : null}

            <div className="whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
              {blog.content}
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
};

export default BlogDetailsPage;

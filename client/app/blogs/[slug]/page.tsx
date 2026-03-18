import Link from 'next/link';

interface Blog {
  id?: string;
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  createdAt?: string;
}

async function getBlog(slug: string) {
  try {
    const res = await fetch(`http://localhost:3009/api/blogs/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as Blog;
  } catch {
    return null;
  }
}

export default async function BlogDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return (
      <div className="min-h-[60vh] bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-900">Article introuvable</h1>
          <p className="mb-8 text-gray-500">Ce blog n'existe pas ou n'est pas publié.</p>
          <Link
            href="/blogs"
            className="inline-flex rounded-md bg-primary px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            Retour aux blogs
          </Link>
        </div>
      </div>
    );
  }

  const gallery = blog.images?.length ? blog.images : blog.coverImage ? [blog.coverImage] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <Link href="/blogs" className="mb-6 inline-block font-medium text-primary hover:underline">
          ← Retour aux blogs
        </Link>

        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">Blog Carlaville</p>
          <h1 className="mb-4 text-3xl font-black leading-tight text-gray-900 md:text-4xl">
            {blog.title}
          </h1>
          <p className="mb-8 text-gray-500">{blog.excerpt}</p>

          {gallery.length > 0 ? (
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {gallery.map((imageUrl) => (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={blog.title}
                  className="h-64 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          ) : null}

          <div className="prose max-w-none whitespace-pre-line text-gray-700">
            {blog.content}
          </div>
        </article>
      </div>
    </div>
  );
}

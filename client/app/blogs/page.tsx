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

async function getBlogs() {
  try {
    const res = await fetch('http://localhost:3009/api/blogs?limit=30', {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { blogs: [] as Blog[] };
    }

    return (await res.json()) as { blogs: Blog[] };
  } catch {
    return { blogs: [] as Blog[] };
  }
}

export default async function BlogsPage() {
  const data = await getBlogs();
  const blogs = data?.blogs || [];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-black text-gray-900 md:text-5xl">Nos Blogs</h1>
          <div className="mx-auto h-1.5 w-28 rounded-full bg-primary"></div>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-500">
            Tous nos conseils voyage, location et mobilité.
          </p>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {blogs.map((blog) => {
              const previewImage =
                typeof blog.coverImage === 'string' && /^(https?:\/\/|\/)/i.test(blog.coverImage)
                  ? blog.coverImage
                  : blog.images?.[0];

              return (
              <Link
                key={blog.id || blog._id || blog.slug}
                href={`/blogs/${blog.slug}`}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={blog.title}
                    className="mb-5 h-48 w-full rounded-xl object-cover"
                  />
                ) : null}
                <h2 className="mb-3 text-2xl font-extrabold leading-tight text-gray-900">
                  {blog.title}
                </h2>
                <p className="mb-4 line-clamp-3 text-gray-500">{blog.excerpt}</p>
                <div className="text-sm font-medium text-primary">Lire l'article</div>
              </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center">
            <p className="text-lg text-gray-500">Aucun blog publié pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Content Management</h2>
        <p className="mt-2 text-sm text-slate-600">
          Publish professional blog articles and display them on the public home page.
        </p>
        <a
          href="/admin/blogs"
          className="mt-4 inline-flex rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Manage Blogs
        </a>
      </div>
    </div>
  );
}

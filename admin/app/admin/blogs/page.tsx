import { PageHeader } from '@/components/shared/page-header';
import { BlogManagement } from '@/features/blogs/components/blog-management';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des Blogs',
  description: 'Édition et publication d\'articles pour Carlaville.',
};

export default function BlogsPage() {
  return (
    <div>
      <PageHeader title="Gestion des Articles" />
      <div className="p-6">
        <BlogManagement />
      </div>
    </div>
  );
}

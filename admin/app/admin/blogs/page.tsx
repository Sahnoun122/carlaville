'use client';

import { PageHeader } from '@/components/shared/page-header';
import { BlogManagement } from '@/features/blogs/components/blog-management';

const BlogsPage = () => {
  return (
    <div>
      <PageHeader title="Blog Management" />
      <div className="p-6">
        <BlogManagement />
      </div>
    </div>
  );
};

export default BlogsPage;

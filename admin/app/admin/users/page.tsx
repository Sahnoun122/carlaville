'use client';

import { PageHeader } from '@/components/shared/page-header';
import { UserManagement } from '@/features/users/components/user-management';

const UsersPage = () => {
  return (
    <div>
      <PageHeader title="User Management" />
      <div className="p-6">
        <UserManagement />
      </div>
    </div>
  );
};

export default UsersPage;

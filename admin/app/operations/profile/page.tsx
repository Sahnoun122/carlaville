'use client';

import { EditProfileForm } from '@/components/admin/profile/edit-profile-form';
import { PageHeader } from '@/components/shared/page-header';

const OperationsProfilePage = () => {
  return (
    <div>
      <PageHeader title="My Profile" />
      <div className="p-6">
        <EditProfileForm />
      </div>
    </div>
  );
};

export default OperationsProfilePage;

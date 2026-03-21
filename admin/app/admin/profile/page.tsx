"use client";

import { PageHeader } from '@/components/shared/page-header';
import { EditProfileForm } from '@/components/admin/profile/edit-profile-form';

const ProfilePage = () => {

  return (
    <div>
      <PageHeader title="Mon Profil" />
      <div className="p-6">
        <EditProfileForm />
      </div>
    </div>
  );
};

export default ProfilePage;

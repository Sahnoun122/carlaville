import { PageHeader } from "@/components/shared/page-header";
import { EditProfileForm } from "@/components/admin/profile/edit-profile-form";
import { getCurrentUser } from "@/lib/auth-service";

const ProfilePage = async () => {
  const user = await getCurrentUser();

  return (
    <div>
      <PageHeader title="My Profile" />
      <div className="p-6">
        <EditProfileForm user={user} />
      </div>
    </div>
  );
};

export default ProfilePage;

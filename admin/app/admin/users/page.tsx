import { PageHeader } from '@/components/shared/page-header';
import { UserManagement } from '@/features/users/components/user-management';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des Utilisateurs',
  description: 'Contrôle des accès et gestion des profils clients.',
};

export default function UsersPage() {
  return (
    <div>
      <PageHeader title="Gestion des Utilisateurs" />
      <div className="p-6">
        <UserManagement />
      </div>
    </div>
  );
}

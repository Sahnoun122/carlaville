import { AgencyManagement } from '@/features/agencies/components/agency-management';

export const metadata = {
  title: 'Agences | Carlaville Admin',
  description: 'Gestion des agences partenaires.',
};

export default function AgenciesPage() {
  return <AgencyManagement />;
}

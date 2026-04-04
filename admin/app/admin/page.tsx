import { AdminOverviewDashboard } from '@/features/dashboard/components/admin-overview-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de Bord',
  description: 'Vue d\'ensemble des opérations de Carlaville.',
};

export default function AdminDashboard() {
  return <AdminOverviewDashboard />;
}

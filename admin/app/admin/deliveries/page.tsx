import { PageHeader } from '@/components/shared/page-header';
import { AdminDeliveriesManagement } from '@/features/deliveries/components/admin-deliveries-management';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des Livraisons',
  description: 'Suivi des livraisons et retours de véhicules.',
};

export default function AdminDeliveriesPage() {
  return (
    <div>
      <PageHeader title="Gestion des Livraisons" />
      <div className="p-6">
        <AdminDeliveriesManagement />
      </div>
    </div>
  );
}

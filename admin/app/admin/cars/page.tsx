import { PageHeader } from '@/components/shared/page-header';
import { CarManagement } from '@/features/cars/components/car-management';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flotte de Véhicules',
  description: 'Gestion de la flotte de véhicules Carlaville.',
};

export default function CarsPage() {
  return (
    <div>
      <PageHeader title="Gestion des Véhicules" />
      <div className="p-6">
        <CarManagement />
      </div>
    </div>
  );
}

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ReservationManagement } from '@/features/reservations/components/reservation-management';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des Réservations',
  description: 'Contrôle et suivi des réservations de véhicules.',
};

export default function ReservationsPage() {
  return (
    <div>
      <PageHeader title="Gestion des Réservations">
        <Link href="/admin/reservations/settings">
          <Button variant="outline">Paramètres de Réservation</Button>
        </Link>
      </PageHeader>
      <div className="p-6">
        <ReservationManagement />
      </div>
    </div>
  );
}

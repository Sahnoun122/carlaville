'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ReservationExtrasManagement } from '@/features/reservations/components/reservation-extras-management';

const ReservationExtrasSettingsPage = () => {
  return (
    <div>
      <PageHeader title="Paramètres Options & Extras">
        <Link href="/admin/reservations/settings">
          <Button variant="outline">Retour aux paramètres</Button>
        </Link>
      </PageHeader>
      <div className="p-6">
        <ReservationExtrasManagement />
      </div>
    </div>
  );
};

export default ReservationExtrasSettingsPage;

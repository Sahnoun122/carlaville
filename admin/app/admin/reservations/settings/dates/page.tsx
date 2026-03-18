'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ReservationDatePolicyManagement } from '@/features/reservations/components/reservation-date-policy-management';

const ReservationDatesSettingsPage = () => {
  return (
    <div>
      <PageHeader title="Paramètres des dates de réservation">
        <Link href="/admin/reservations/settings">
          <Button variant="outline">Retour aux paramètres</Button>
        </Link>
      </PageHeader>
      <div className="p-6">
        <ReservationDatePolicyManagement />
      </div>
    </div>
  );
};

export default ReservationDatesSettingsPage;

'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ReservationManagement } from '@/features/reservations/components/reservation-management';

const ReservationsPage = () => {
  return (
    <div>
      <PageHeader title="Reservation Management">
        <Link href="/admin/reservations/settings">
          <Button variant="outline">Reservation Settings</Button>
        </Link>
      </PageHeader>
      <div className="p-6">
        <ReservationManagement />
      </div>
    </div>
  );
};

export default ReservationsPage;

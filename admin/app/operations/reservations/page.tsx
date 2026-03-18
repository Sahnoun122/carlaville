'use client';

import { PageHeader } from '@/components/shared/page-header';
import { ReservationManagement } from '@/features/reservations/components/reservation-management';

const OperationsReservationsPage = () => {
  return (
    <div>
      <PageHeader title="Reservations" />
      <div className="p-6">
        <ReservationManagement />
      </div>
    </div>
  );
};

export default OperationsReservationsPage;

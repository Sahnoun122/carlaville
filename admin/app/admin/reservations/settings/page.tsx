'use client';

import { PageHeader } from '@/components/shared/page-header';
import { ReservationDayControlManagement } from '@/features/reservations/components/reservation-day-control-management';

const ReservationSettingsPage = () => {
  return (
    <div>
      <PageHeader title="Reservation Settings" />
      <div className="p-6">
        <ReservationDayControlManagement />
      </div>
    </div>
  );
};

export default ReservationSettingsPage;

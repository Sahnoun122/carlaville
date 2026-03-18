'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ReservationStatus } from '@/types';
import {
  getReservationManagerDashboardStats,
  ReservationManagerDashboardStats,
} from '@/features/reservations/services/reservation-service';

const statsCards: Array<{
  key: keyof ReservationManagerDashboardStats['reservations'];
  label: string;
}> = [
  { key: 'total', label: 'Total Reservations' },
  { key: 'pending', label: 'Pending Reservations' },
  { key: 'confirmed', label: 'Confirmed Reservations' },
  { key: 'activeRentals', label: 'Active Rentals' },
  { key: 'todayPickups', label: 'Today Pickups' },
  { key: 'todayReturns', label: 'Today Returns' },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const statusClassMap: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'bg-amber-100 text-amber-700',
  [ReservationStatus.CONFIRMED]: 'bg-green-100 text-green-700',
  [ReservationStatus.REJECTED]: 'bg-red-100 text-red-700',
  [ReservationStatus.READY_FOR_DELIVERY]: 'bg-blue-100 text-blue-700',
  [ReservationStatus.IN_DELIVERY]: 'bg-indigo-100 text-indigo-700',
  [ReservationStatus.DELIVERED]: 'bg-violet-100 text-violet-700',
  [ReservationStatus.ACTIVE_RENTAL]: 'bg-sky-100 text-sky-700',
  [ReservationStatus.RETURN_SCHEDULED]: 'bg-cyan-100 text-cyan-700',
  [ReservationStatus.RETURNED]: 'bg-emerald-100 text-emerald-700',
  [ReservationStatus.CANCELLED]: 'bg-gray-200 text-gray-700',
  [ReservationStatus.COMPLETED]: 'bg-zinc-200 text-zinc-700',
};

const statusLabelMap: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'Pending',
  [ReservationStatus.CONFIRMED]: 'Confirmed',
  [ReservationStatus.REJECTED]: 'Rejected',
  [ReservationStatus.READY_FOR_DELIVERY]: 'Ready for Delivery',
  [ReservationStatus.IN_DELIVERY]: 'In Delivery',
  [ReservationStatus.DELIVERED]: 'Delivered',
  [ReservationStatus.ACTIVE_RENTAL]: 'Active Rental',
  [ReservationStatus.RETURN_SCHEDULED]: 'Return Scheduled',
  [ReservationStatus.RETURNED]: 'Returned',
  [ReservationStatus.CANCELLED]: 'Cancelled',
  [ReservationStatus.COMPLETED]: 'Completed',
};

export const ReservationManagerDashboard = () => {
  const statsQuery = useQuery({
    queryKey: ['reservation-manager-dashboard'],
    queryFn: getReservationManagerDashboardStats,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Reservation Manager Dashboard">
        <div className="flex gap-2">
          <Link href="/operations/reservations">
            <Button>Manage Reservations</Button>
          </Link>
          <Link href="/operations/maintenance">
            <Button variant="outline">View Maintenance</Button>
          </Link>
        </div>
      </PageHeader>

      {statsQuery.isLoading && (
        <div className="rounded-md border bg-white p-4 text-sm text-gray-500">
          Loading dashboard...
        </div>
      )}

      {statsQuery.isError && (
        <div className="rounded-md border bg-white p-4 text-sm text-red-600">
          Failed to load dashboard metrics. Please refresh.
        </div>
      )}

      {statsQuery.data && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statsCards.map((card) => (
              <div key={card.key} className="rounded-md border bg-white p-4">
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold">
                  {statsQuery.data.reservations[card.key]}
                </p>
              </div>
            ))}

            <div className="rounded-md border bg-white p-4">
              <p className="text-sm text-gray-500">Cars In Maintenance</p>
              <p className="mt-1 text-2xl font-semibold">
                {statsQuery.data.maintenance.inProgressCars}
              </p>
            </div>
          </div>

          <div className="rounded-md border bg-white p-4">
            <h2 className="text-lg font-semibold">Recent Reservations</h2>
            <p className="mb-4 text-sm text-gray-500">
              Last created reservations to track current operations quickly.
            </p>

            {statsQuery.data.recentReservations.length === 0 ? (
              <p className="text-sm text-gray-500">No reservations yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-3 py-2 font-medium">Reference</th>
                      <th className="px-3 py-2 font-medium">Customer</th>
                      <th className="px-3 py-2 font-medium">Pickup</th>
                      <th className="px-3 py-2 font-medium">Return</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsQuery.data.recentReservations.map((reservation) => (
                      <tr key={reservation._id} className="border-t">
                        <td className="px-3 py-2 font-medium">{reservation.bookingReference}</td>
                        <td className="px-3 py-2">{reservation.customerName}</td>
                        <td className="px-3 py-2">{formatDate(reservation.pickupDate)}</td>
                        <td className="px-3 py-2">{formatDate(reservation.returnDate)}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              statusClassMap[reservation.status] ?? 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {statusLabelMap[reservation.status] ?? reservation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import {
  CalendarCheck,
  CalendarClock,
  CalendarSync,
  CheckCircle2,
  ClipboardList,
  Timer,
  Wrench,
} from 'lucide-react';
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
  icon: ComponentType<{ className?: string }>;
  tone: string;
}> = [
  {
    key: 'total',
    label: 'Réservations totales',
    icon: ClipboardList,
    tone: 'from-red-50 to-white border-red-100',
  },
  {
    key: 'pending',
    label: 'En attente',
    icon: Timer,
    tone: 'from-amber-50 to-white border-amber-100',
  },
  {
    key: 'confirmed',
    label: 'Confirmées',
    icon: CheckCircle2,
    tone: 'from-emerald-50 to-white border-emerald-100',
  },
  {
    key: 'activeRentals',
    label: 'Locations actives',
    icon: CalendarSync,
    tone: 'from-sky-50 to-white border-sky-100',
  },
  {
    key: 'todayPickups',
    label: 'Départs du jour',
    icon: CalendarClock,
    tone: 'from-indigo-50 to-white border-indigo-100',
  },
  {
    key: 'todayReturns',
    label: 'Retours du jour',
    icon: CalendarCheck,
    tone: 'from-violet-50 to-white border-violet-100',
  },
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
  [ReservationStatus.PENDING]: 'En attente',
  [ReservationStatus.CONFIRMED]: 'Confirmée',
  [ReservationStatus.REJECTED]: 'Rejetée',
  [ReservationStatus.READY_FOR_DELIVERY]: 'Prête pour livraison',
  [ReservationStatus.IN_DELIVERY]: 'En livraison',
  [ReservationStatus.DELIVERED]: 'Livrée',
  [ReservationStatus.ACTIVE_RENTAL]: 'Location active',
  [ReservationStatus.RETURN_SCHEDULED]: 'Retour programmé',
  [ReservationStatus.RETURNED]: 'Retournée',
  [ReservationStatus.CANCELLED]: 'Annulée',
  [ReservationStatus.COMPLETED]: 'Terminée',
};

export const ReservationManagerDashboard = () => {
  const statsQuery = useQuery({
    queryKey: ['reservation-manager-dashboard'],
    queryFn: getReservationManagerDashboardStats,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Opérations">
        <div className="flex gap-2">
          <Link href="/operations/reservations">
            <Button>Gérer les réservations</Button>
          </Link>
          <Link href="/operations/maintenance">
            <Button variant="outline">Voir la maintenance</Button>
          </Link>
        </div>
      </PageHeader>

      {statsQuery.isLoading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm font-medium text-gray-500 shadow-sm">
          Chargement du dashboard...
        </div>
      )}

      {statsQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700 shadow-sm">
          Impossible de charger les indicateurs. Veuillez actualiser.
        </div>
      )}

      {statsQuery.data && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statsCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.key}
                  className={`rounded-2xl border bg-linear-to-br p-5 shadow-sm ${card.tone}`}
                >
                  <div className="mb-3 inline-flex rounded-lg bg-white p-2 text-primary shadow-sm">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">{card.label}</p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                    {statsQuery.data.reservations[card.key]}
                  </p>
                </div>
              );
            })}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-lg bg-red-50 p-2 text-primary shadow-sm">
                <Wrench className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-gray-600">Véhicules en maintenance</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                {statsQuery.data.maintenance.inProgressCars}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-gray-900">Réservations récentes</h2>
            <p className="mb-4 text-sm font-medium text-gray-500">
              Dernières réservations créées pour un suivi opérationnel rapide.
            </p>

            {statsQuery.data.recentReservations.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune réservation pour le moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-gray-600">Référence</th>
                      <th className="px-3 py-2 font-semibold text-gray-600">Client</th>
                      <th className="px-3 py-2 font-semibold text-gray-600">Départ</th>
                      <th className="px-3 py-2 font-semibold text-gray-600">Retour</th>
                      <th className="px-3 py-2 font-semibold text-gray-600">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsQuery.data.recentReservations.map((reservation) => (
                      <tr key={reservation._id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-semibold text-gray-900">{reservation.bookingReference}</td>
                        <td className="px-3 py-2 text-gray-700">{reservation.customerName}</td>
                        <td className="px-3 py-2 text-gray-700">{formatDate(reservation.pickupDate)}</td>
                        <td className="px-3 py-2 text-gray-700">{formatDate(reservation.returnDate)}</td>
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
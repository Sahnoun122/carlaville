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
  ArrowRight,
  ChevronRight,
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
  color: string;
  bg: string;
  border: string;
}> = [
  {
    key: 'total',
    label: 'Réservations totales',
    icon: ClipboardList,
    color: 'text-gray-600',
    bg: 'bg-white',
    border: 'border-gray-100',
  },
  {
    key: 'pending',
    label: 'En attente',
    icon: Timer,
    color: 'text-amber-600',
    bg: 'bg-amber-50/30',
    border: 'border-amber-100',
  },
  {
    key: 'confirmed',
    label: 'Confirmées',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50/30',
    border: 'border-emerald-100',
  },
  {
    key: 'activeRentals',
    label: 'Locations actives',
    icon: CalendarSync,
    color: 'text-red-600',
    bg: 'bg-red-50/30',
    border: 'border-red-100',
  },
  {
    key: 'todayPickups',
    label: 'Départs du jour',
    icon: CalendarClock,
    color: 'text-blue-600',
    bg: 'bg-blue-50/30',
    border: 'border-blue-100',
  },
  {
    key: 'todayReturns',
    label: 'Retours du jour',
    icon: CalendarCheck,
    color: 'text-violet-600',
    bg: 'bg-violet-50/30',
    border: 'border-violet-100',
  },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const statusClassMap: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'bg-amber-50 text-amber-600 border border-amber-100',
  [ReservationStatus.CONFIRMED]: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  [ReservationStatus.REJECTED]: 'bg-red-50 text-red-600 border border-red-100',
  [ReservationStatus.READY_FOR_DELIVERY]: 'bg-blue-50 text-blue-600 border border-blue-100',
  [ReservationStatus.IN_DELIVERY]: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
  [ReservationStatus.DELIVERED]: 'bg-violet-50 text-violet-600 border border-violet-100',
  [ReservationStatus.ACTIVE_RENTAL]: 'bg-sky-50 text-sky-600 border border-sky-100',
  [ReservationStatus.RETURN_SCHEDULED]: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
  [ReservationStatus.RETURNED]: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  [ReservationStatus.CANCELLED]: 'bg-gray-50 text-gray-500 border border-gray-200',
  [ReservationStatus.COMPLETED]: 'bg-zinc-50 text-zinc-600 border border-zinc-200',
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard Opérations" 
        description="Gérez le flux de réservations et le suivi opérationnel quotidien."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/operations/reservations">
            <Button className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 text-white font-bold h-11 px-6 rounded-xl transition-all hover:-translate-y-0.5">
              Gérer les réservations
            </Button>
          </Link>
          <Link href="/operations/maintenance">
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50 font-bold h-11 px-6 rounded-xl transition-all">
              Voir la maintenance
            </Button>
          </Link>
        </div>
      </PageHeader>

      {statsQuery.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-[2rem] animate-pulse"></div>
          ))}
        </div>
      )}

      {statsQuery.isError && (
        <div className="rounded-[2rem] border-2 border-dashed border-red-100 bg-red-50/30 p-8 text-center">
          <p className="text-red-600 font-bold">Impossible de charger les indicateurs. Veuillez actualiser.</p>
        </div>
      )}

      {statsQuery.data && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {statsCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.key}
                  className={`group relative rounded-[2.5rem] border ${card.border} ${card.bg} p-7 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`rounded-2xl ${card.bg.replace('/30', '')} p-3 ${card.color} border ${card.border} shadow-sm transition-transform group-hover:scale-110`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-red-500 transition-colors">Statistique</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 mb-1">{card.label}</p>
                    <div className="flex items-baseline gap-2">
                       <p className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
                        {statsQuery.data.reservations[card.key]}
                      </p>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-red-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="rounded-[2.5rem] border border-gray-100 bg-white p-7 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50 group">
              <div className="flex justify-between items-start mb-4">
                <div className="rounded-2xl bg-red-50 p-3 text-red-600 border border-red-100 shadow-sm transition-transform group-hover:scale-110">
                  <Wrench className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-red-500 transition-colors">Fleet Care</span>
              </div>
              <p className="text-sm font-bold text-gray-500 mb-1">Véhicules en maintenance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
                  {statsQuery.data.maintenance.inProgressCars}
                </p>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-red-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-gray-900">Réservations récentes</h2>
                <p className="text-sm font-bold text-gray-400">Suivi opérationnel des derniers mouvements.</p>
              </div>
              <Link href="/operations/reservations" className="text-xs font-black text-red-600 uppercase tracking-widest hover:text-red-700 flex items-center gap-1.5 group">
                Voir tout <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {statsQuery.data.recentReservations.length === 0 ? (
              <div className="py-20 text-center">
                 <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                 <p className="text-gray-400 font-bold">Aucune réservation pour le moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] rounded-l-2xl">Référence</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Client</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Dates</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] rounded-r-2xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {statsQuery.data.recentReservations.map((reservation) => (
                      <tr key={reservation._id} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5 align-middle">
                          <span className="font-mono text-xs font-black text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                            {reservation.bookingReference}
                          </span>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <p className="text-sm font-black text-gray-900">{reservation.customerName}</p>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                             <span>{formatDate(reservation.pickupDate)}</span>
                             <span className="text-gray-300">→</span>
                             <span className="text-gray-500 font-medium">{formatDate(reservation.returnDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                              statusClassMap[reservation.status] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {statusLabelMap[reservation.status] ?? reservation.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right align-middle">
                           <Link href={`/operations/reservations?ref=${reservation.bookingReference}`}>
                              <button className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-md transition-all text-gray-400">
                                <ArrowRight className="w-4 h-4" />
                              </button>
                           </Link>
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
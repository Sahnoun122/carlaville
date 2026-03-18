'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Car,
  ClipboardList,
  Gauge,
  Settings,
  UserRound,
  Wrench,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { getReservationManagerDashboardStats } from '@/features/reservations/services/reservation-service';

const overviewCards = [
  {
    key: 'total' as const,
    label: 'Réservations totales',
    hint: 'Volume global des réservations',
    tone: 'from-red-50 to-white border-red-100',
  },
  {
    key: 'pending' as const,
    label: 'En attente',
    hint: 'Demandes à valider rapidement',
    tone: 'from-amber-50 to-white border-amber-100',
  },
  {
    key: 'confirmed' as const,
    label: 'Confirmées',
    hint: 'Réservations prêtes pour exécution',
    tone: 'from-emerald-50 to-white border-emerald-100',
  },
  {
    key: 'activeRentals' as const,
    label: 'Locations actives',
    hint: 'Contrats en cours actuellement',
    tone: 'from-sky-50 to-white border-sky-100',
  },
  {
    key: 'todayPickups' as const,
    label: 'Départs du jour',
    hint: 'Retraits planifiés aujourd’hui',
    tone: 'from-indigo-50 to-white border-indigo-100',
  },
  {
    key: 'todayReturns' as const,
    label: 'Retours du jour',
    hint: 'Retours attendus aujourd’hui',
    tone: 'from-violet-50 to-white border-violet-100',
  },
];

const quickActions = [
  {
    title: 'Gestion des réservations',
    description: 'Valider, confirmer ou rejeter les demandes clients.',
    href: '/admin/reservations',
    icon: ClipboardList,
  },
  {
    title: 'Gestion des véhicules',
    description: 'Mettre à jour flotte, prix, images et disponibilité.',
    href: '/admin/cars',
    icon: Car,
  },
  {
    title: 'Maintenance',
    description: 'Suivre les interventions et indisponibilités.',
    href: '/admin/maintenance',
    icon: Wrench,
  },
  {
    title: 'Utilisateurs',
    description: 'Piloter les comptes et rôles de l’organisation.',
    href: '/admin/users',
    icon: UserRound,
  },
  {
    title: 'Paramètres réservation',
    description: 'Régler les règles de durée et disponibilité.',
    href: '/admin/reservations/settings',
    icon: Settings,
  },
  {
    title: 'Blogs & contenu',
    description: 'Publier du contenu pour la vitrine client.',
    href: '/admin/blogs',
    icon: Gauge,
  },
];

export const AdminOverviewDashboard = () => {
  const statsQuery = useQuery({
    queryKey: ['admin-overview-dashboard'],
    queryFn: getReservationManagerDashboardStats,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Admin">
        <Link href="/admin/reservations">
          <Button>Voir les réservations</Button>
        </Link>
      </PageHeader>

      {statsQuery.isLoading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm font-medium text-gray-500 shadow-sm">
          Chargement des indicateurs...
        </div>
      )}

      {statsQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700 shadow-sm">
          Impossible de charger les statistiques. Réessayez dans un instant.
        </div>
      )}

      {statsQuery.data && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {overviewCards.map((card) => (
              <div
                key={card.key}
                className={`rounded-2xl border bg-linear-to-br p-5 shadow-sm ${card.tone}`}
              >
                <p className="text-sm font-semibold text-gray-600">{card.label}</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                  {statsQuery.data.reservations[card.key]}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500">{card.hint}</p>
              </div>
            ))}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-600">Véhicules en maintenance</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-gray-900">
                {statsQuery.data.maintenance.inProgressCars}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-500">
                Véhicules actuellement indisponibles.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-gray-900">Actions rapides</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Back Office</span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:border-red-200 hover:bg-red-50"
                  >
                    <div className="mb-3 inline-flex rounded-lg bg-white p-2 text-primary shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">{action.title}</p>
                    <p className="mt-1 text-xs font-medium text-gray-600">{action.description}</p>
                    <span className="mt-3 inline-flex items-center text-xs font-bold text-red-700">
                      Ouvrir
                      <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const overviewCards = [
  {
    key: 'total' as const,
    label: 'Réservations totales',
    hint: 'Volume global des réservations',
  },
  {
    key: 'pending' as const,
    label: 'En attente',
    hint: 'Demandes à valider rapidement',
  },
  {
    key: 'confirmed' as const,
    label: 'Confirmées',
    hint: 'Réservations prêtes pour exécution',
  },
  {
    key: 'activeRentals' as const,
    label: 'Locations actives',
    hint: 'Contrats en cours actuellement',
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map((card) => (
              <div
                key={card.key}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-500">{card.label}</p>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="text-3xl font-black tracking-tight text-gray-900">
                    {statsQuery.data.reservations[card.key]}
                  </p>
                </div>
                <p className="mt-2 text-xs font-medium text-gray-400">{card.hint}</p>
              </div>
            ))}
          </div>

          {/* Analyse & Statistiques */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Revenue Chart */}
            <div className="col-span-1 xl:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-gray-900">Revenus Estimés</h3>
                  <p className="text-xs font-medium text-gray-400">Projection sur les 6 derniers mois (MAD)</p>
                </div>
              </div>
              <div className="h-64">
                <Bar
                  data={{
                    labels: statsQuery.data.revenue?.map((r) => r.label) || [],
                    datasets: [
                      {
                        label: 'Revenus (MAD)',
                        data: statsQuery.data.revenue?.map((r) => r.amount) || [],
                        backgroundColor: '#ef4444',
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, border: { display: false } },
                      x: { grid: { display: false }, border: { display: false } }
                    }
                  }}
                />
              </div>
            </div>

            {/* Status Doughnut Chart */}
            <div className="col-span-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-gray-900">Répartition</h3>
                  <p className="text-xs font-medium text-gray-400">Statut actuel des réservations</p>
                </div>
              </div>
              <div className="h-64 relative">
                <Doughnut
                  data={{
                    labels: ['En attente', 'Confirmées', 'En location'],
                    datasets: [
                      {
                        data: [
                          statsQuery.data.reservations.pending,
                          statsQuery.data.reservations.confirmed,
                          statsQuery.data.reservations.activeRentals,
                        ],
                        backgroundColor: ['#fcd34d', '#34d399', '#ef4444'],
                        borderWidth: 0,
                        hoverOffset: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mt-6">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-black tracking-tight text-gray-900">Actions rapides</h2>
              <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-500">Raccourcis</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group rounded-2xl border border-gray-100 bg-gray-50/50 p-5 transition-all hover:border-red-200 hover:bg-white hover:shadow-md"
                  >
                    <div className="mb-4 inline-flex rounded-xl bg-white p-3 text-gray-400 shadow-sm transition-colors border border-gray-100 group-hover:border-red-100 group-hover:bg-red-50 group-hover:text-red-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-base font-bold text-gray-900">{action.title}</p>
                    <p className="mt-1.5 text-sm font-medium text-gray-500 line-clamp-2">{action.description}</p>
                    <div className="mt-4 flex items-center text-sm font-bold text-gray-400 transition-colors group-hover:text-red-600">
                      Ouvrir
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
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

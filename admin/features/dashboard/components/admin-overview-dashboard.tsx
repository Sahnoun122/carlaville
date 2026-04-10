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
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  LayoutDashboard,
  RefreshCcw,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Search,
  MoreHorizontal,
  ChevronRight,
  CircleCheck,
  CircleAlert,
  CircleDot
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { getReservationManagerDashboardStats } from '@/features/reservations/services/reservation-service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const quickActions = [
  {
    title: 'Réservations',
    description: 'Valider et gérer les demandes.',
    href: '/admin/reservations',
    icon: ClipboardList,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    hover: 'hover:border-emerald-200'
  },
  {
    title: 'Véhicules',
    description: 'Gestion de la flotte et prix.',
    href: '/admin/cars',
    icon: Car,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    hover: 'hover:border-blue-200'
  },
  {
    title: 'Maintenance',
    description: 'Suivi technique et réparations.',
    href: '/admin/maintenance',
    icon: Wrench,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    hover: 'hover:border-amber-200'
  },
  {
    title: 'Utilisateurs',
    description: 'Comptes et rôles équipe.',
    href: '/admin/users',
    icon: UserRound,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    hover: 'hover:border-purple-200'
  },
  {
    title: 'Analytics',
    description: 'Revenus et performances.',
    href: '/admin/revenue',
    icon: TrendingUp,
    color: 'bg-red-50 text-red-600 border-red-100',
    hover: 'hover:border-red-200'
  },
  {
    title: 'Blogs',
    description: 'Contenu et vitrine client.',
    href: '/admin/blogs',
    icon: Gauge,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    hover: 'hover:border-indigo-200'
  },
];

export const AdminOverviewDashboard = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['admin-overview-dashboard'],
    queryFn: getReservationManagerDashboardStats,
  });

  const revenueChartData = {
    labels: data?.revenue?.map(r => r.label) || [],
    datasets: [
      {
        fill: true,
        label: 'Revenu',
        data: data?.revenue?.map(r => r.amount) || [],
        borderColor: '#ef4444',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          return gradient;
        },
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#171717',
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 10, weight: 'bold' as const },
        bodyFont: { size: 12, weight: 'bold' as const },
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.02)', drawBorder: false },
        ticks: { font: { weight: 'bold' as const, size: 10 }, color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { font: { weight: 'bold' as const, size: 10 }, color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="w-full space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Système en ligne</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
            Tableau de <span className="text-red-600">Bord</span>
          </h1>
          <p className="font-bold text-slate-400">Suivez la performance globale de Carla Ville en temps réel.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
           <Button
             variant="outline"
             onClick={() => refetch()}
             disabled={isLoading || isRefetching}
             className="h-14 w-full rounded-2xl p-0 border-slate-200 hover:bg-slate-50 transition-all shadow-sm sm:w-14"
           >
             <RefreshCcw size={20} className={cn(isRefetching && "animate-spin", "text-slate-500")} />
           </Button>
           <Link href="/admin/reservations">
             <Button className="h-14 w-full px-8 rounded-2xl bg-slate-900 font-black text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 sm:w-auto">
               Nouvelle Réservation
             </Button>
           </Link>
        </div>
      </div>

      {isLoading && !isRefetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-40 bg-white rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm" />
           ))}
        </div>
      ) : isError ? (
        <div className="p-12 text-center rounded-[3rem] bg-rose-50 border border-rose-100">
           <p className="text-rose-600 font-bold">Une erreur est survenue lors du chargement des statistiques.</p>
        </div>
      ) : data && (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
             <KPICard 
               label="Volume Global" 
               value={data.reservations.total} 
               icon={<ClipboardList size={22} />}
               hint="Réservations totales"
               color="emerald"
               trend="+12% ce mois"
             />
             <KPICard 
               label="Alertes Action" 
               value={data.reservations.pending} 
               icon={<CircleAlert size={22} />}
               hint="En attente de validation"
               color="amber"
               isWarning={data.reservations.pending > 0}
             />
             <KPICard 
               label="Flux Logistique" 
               value={data.reservations.todayPickups + data.reservations.todayReturns} 
               icon={<RefreshCcw size={22} />}
               hint="Pickups & Retours (Aujourd'hui)"
               color="blue"
               subValue={`${data.reservations.todayPickups}↑ / ${data.reservations.todayReturns}↓`}
             />
             <KPICard 
               label="Disponibilité" 
               value={data.maintenance.inProgressCars} 
               icon={<Wrench size={22} />}
               hint="Véhicules en maintenance"
               color="red"
             />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Revenue Trend Chart */}
             <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 relative z-10">
                 <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">Flux Financier</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revenus nets par période</p>
                   </div>
                 <Link href="/admin/revenue" className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all self-start sm:self-auto">
                      <ArrowUpRight size={18} />
                   </Link>
                </div>
                <div className="h-64 h-[300px] w-full relative z-10">
                   <Line data={revenueChartData} options={chartOptions} />
                </div>
             </div>

             {/* Distribution Chart */}
             <div className="bg-white rounded-[3rem] border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-sm transition-all hover:shadow-md">
                <div className="mb-8">
                   <h3 className="text-xl font-black text-slate-900 leading-tight">État Flotte</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Répartition des Réservations</p>
                </div>
                <div className="h-64 relative">
                   <Doughnut 
                     data={{
                       labels: ['En attente', 'Confirmées', 'En location'],
                       datasets: [{
                         data: [data.reservations.pending, data.reservations.confirmed, data.reservations.activeRentals],
                         backgroundColor: ['#fcd34d', '#10b981', '#ef4444'],
                         borderWidth: 0,
                         hoverOffset: 15,
                         borderRadius: 8,
                       }]
                     }}
                     options={{
                       responsive: true,
                       maintainAspectRatio: false,
                       cutout: '80%',
                       plugins: {
                         legend: { position: 'bottom', labels: { usePointStyle: true, padding: 25, font: { weight: 'bold', size: 10 }, color: '#94a3b8' } },
                       }
                     }}
                   />
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-black text-slate-900 leading-none">{data.reservations.total}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Rés.</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Recent Reservations stylized table */}
             <div className="bg-white rounded-[3.5rem] p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden relative">
               <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                 <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">Activités Récentes</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">5 dernières réservations</p>
                   </div>
               <Link href="/admin/reservations" className="w-full sm:w-auto">
                      <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-4 rounded-xl border-none">Voir tout</Button>
                   </Link>
                </div>
               <div className="-mx-4 overflow-x-auto px-4">
                  <Table className="border-none shadow-none">
                    <TableBody>
                      {data.recentReservations.map((res) => (
                        <TableRow key={res._id} className="group hover:bg-slate-50 border-none transition-all duration-300">
                          <TableCell className="w-12 text-center py-5">
                             <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                <Clock size={18} />
                             </div>
                          </TableCell>
                          <TableCell>
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900 leading-tight">{res.customerName}</span>
                                <span className="text-[10px] font-bold text-slate-400">{res.bookingReference}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700">{new Date(res.pickupDate).toLocaleDateString('fr-FR')}</span>
                                <span className="text-[9px] font-medium text-slate-400">Pickup</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-right">
                             <span className={cn(
                               "inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight",
                               res.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : 
                               res.status === 'pending' ? "bg-amber-50 text-amber-600" :
                               res.status === 'rejected' ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"
                             )}>
                               {res.status}
                             </span>
                          </TableCell>
                          <TableCell className="w-10">
                             <div className="text-slate-200 group-hover:text-red-500 transition-colors">
                                <ChevronRight size={18} />
                             </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
             </div>

             {/* Dynamic Operations View */}
             <div className="rounded-[3.5rem] bg-neutral-900 border border-neutral-800 p-6 sm:p-8 lg:p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-red-600/20"></div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                   <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 mb-8 backdrop-blur-sm">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></span>
                         <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">IA Insights • Aujourd'hui</span>
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tighter mb-6 leading-tight">Vue d'ensemble <br/><span className="text-red-600">Stratégique</span></h3>
                      
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 my-10">
                         <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Pickups attendus</span>
                            <span className="text-3xl font-black text-white">{data.reservations.todayPickups}</span>
                         </div>
                         <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Retours attendus</span>
                            <span className="text-3xl font-black text-white">{data.reservations.todayReturns}</span>
                         </div>
                      </div>

                      <p className="text-white/40 text-sm font-medium leading-relaxed max-w-sm">
                         Votre taux d'occupation est excellent. Pensez à vérifier les {data.maintenance.inProgressCars} véhicules en maintenance pour maximiser le stock ce weekend.
                      </p>
                   </div>
                   <div className="mt-12 flex items-center gap-6">
                     <Link href="/admin/deliveries" className="group/btn h-14 w-full sm:w-auto pr-8 pl-6 rounded-2xl bg-white flex items-center justify-center font-black text-neutral-900 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20">
                         Gestion Logistique
                         <ArrowRight size={18} className="ml-3 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
               <h2 className="text-xl font-black tracking-tight text-slate-900">Raccourcis Opérationnels</h2>
               <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={cn(
                      "group rounded-3xl border border-slate-100 bg-white p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden",
                      action.hover
                    )}
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50/50 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:scale-150 rotate-12"></div>
                    <div className={cn(
                      "mb-6 inline-flex rounded-2xl p-4 shadow-sm transition-all border group-hover:scale-110 group-hover:rotate-6",
                      action.color
                    )}>
                      <Icon size={20} />
                    </div>
                    <p className="text-sm font-black text-slate-900 tracking-tight">{action.title}</p>
                    <p className="mt-1.5 text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-tight">{action.description}</p>
                    <div className="mt-4 flex items-center text-[9px] font-black text-slate-300 uppercase tracking-widest transition-colors group-hover:text-red-600">
                      Entrer
                      <ChevronRight size={12} className="ml-1 transition-transform group-hover:translate-x-1" />
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

const KPICard = ({ label, value, icon, hint, color, trend, subValue, isWarning }: any) => {
   const colors = {
     emerald: 'from-emerald-50 to-emerald-100/50 text-emerald-600 border-emerald-100 shadow-emerald-100/20',
     amber: 'from-amber-50 to-amber-100/50 text-amber-600 border-amber-100 shadow-amber-100/20',
     blue: 'from-blue-50 to-blue-100/50 text-blue-600 border-blue-100 shadow-blue-100/20',
     red: 'from-rose-50 to-rose-100/50 text-rose-600 border-rose-100 shadow-rose-100/20',
   };

   return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl group relative overflow-hidden flex flex-col justify-between min-h-[14rem] sm:h-56">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-1000 group-hover:scale-150"></div>
        
        <div className="flex items-start justify-between gap-3 relative z-10">
           <div className={cn(
             "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
             colors[color as keyof typeof colors]
           )}>
             {icon}
           </div>
           {trend && (
             <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                {trend}
             </span>
           )}
           {isWarning && (
             <span className="flex h-3 w-3 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
             </span>
           )}
        </div>

        <div className="relative z-10">
           <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h3>
              {subValue && <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{subValue}</span>}
           </div>
           <p className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        </div>

        <div className="pt-4 border-t border-slate-50 relative z-10">
           <p className="text-[9px] font-bold text-slate-400 truncate">{hint}</p>
        </div>
     </div>
   );
};


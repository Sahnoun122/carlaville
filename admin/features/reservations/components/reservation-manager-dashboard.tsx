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
  RefreshCcw,
  Clock,
  ArrowUpRight,
  CircleAlert,
  Calendar,
  Zap,
  TrendingUp,
  MapPin,
  FileText
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ReservationStatus } from '@/types';
import {
  getReservationManagerDashboardStats,
  ReservationManagerDashboardStats,
} from '@/features/reservations/services/reservation-service';
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
import { Bar, Doughnut } from 'react-chartjs-2';
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

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const ReservationManagerDashboard = () => {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['reservation-manager-dashboard'],
    queryFn: getReservationManagerDashboardStats,
  });

  const flowChartData = {
    labels: ['Aujourd\'hui'],
    datasets: [
      {
        label: 'Départs',
        data: [data?.reservations.todayPickups || 0],
        backgroundColor: '#ef4444',
        borderRadius: 12,
        barThickness: 40,
      },
      {
        label: 'Retours',
        data: [data?.reservations.todayReturns || 0],
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        barThickness: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { usePointStyle: true, padding: 20, font: { weight: 'bold' as const, size: 10 }, color: '#94a3b8' } },
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse ring-4 ring-blue-500/10"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opérations en temps réel</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
            Dashboard <span className="text-red-600">Opérations</span>
          </h1>
          <p className="mt-2 font-bold text-slate-400">Gérez le flux de réservations et le suivi logistique quotidien.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button
             variant="outline"
             onClick={() => refetch()}
             disabled={isLoading || isRefetching}
             className="h-14 w-14 rounded-2xl p-0 border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
           >
             <RefreshCcw size={20} className={cn(isRefetching && "animate-spin", "text-slate-500")} />
           </Button>
           <Link href="/operations/reservations">
             <Button className="h-14 px-8 rounded-2xl bg-slate-900 font-black text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
               Suivi Réservations
             </Button>
           </Link>
        </div>
      </div>

      {isLoading && !isRefetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-44 bg-white rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm" />
           ))}
        </div>
      ) : isError ? (
        <div className="p-12 text-center rounded-[3rem] bg-rose-50 border border-rose-100">
           <p className="text-rose-600 font-bold">Une erreur est survenue lors du chargement des opérations.</p>
        </div>
      ) : data && (
        <>
          {/* Operations KPI Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
             <OPCard 
               label="Flux Journalier" 
               value={data.reservations.todayPickups + data.reservations.todayReturns} 
               icon={<CalendarSync size={22} />}
               hint="Mouvements prévus aujourd'hui"
               color="blue"
               subValue={`${data.reservations.todayPickups}↑ / ${data.reservations.todayReturns}↓`}
             />
             <OPCard 
               label="Alertes Action" 
               value={data.reservations.pending} 
               icon={<CircleAlert size={22} />}
               hint="En attente de validation urgente"
               color="amber"
               isWarning={data.reservations.pending > 0}
             />
             <OPCard 
               label="Locations Actives" 
               value={data.reservations.activeRentals} 
               icon={<Zap size={22} />}
               hint="Contrats en cours d'exécution"
               color="emerald"
               trend="+3 nouveaux"
             />
             <OPCard 
               label="Maintenance Fleet" 
               value={data.maintenance.inProgressCars} 
               icon={<Wrench size={22} />}
               hint="Véhicules indisponibles"
               color="red"
             />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Dynamic Flow View */}
             <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm overflow-hidden relative group transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                   <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">Volume de Flux</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Départs vs Retours planifiés</p>
                   </div>
                   <div className="inline-flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-red-500"></div>
                         <span className="text-[10px] font-black text-slate-600 uppercase">Départs</span>
                      </div>
                      <div className="h-3 w-px bg-slate-200"></div>
                      <div className="flex items-center gap-2">
                         <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                         <span className="text-[10px] font-black text-slate-600 uppercase">Retours</span>
                      </div>
                   </div>
                </div>
                <div className="h-64 h-[300px] w-full relative z-10">
                   <Bar data={flowChartData} options={chartOptions} />
                </div>
             </div>

             {/* Distribution Chart */}
             <div className="bg-white rounded-[3rem] border border-slate-200 p-10 shadow-sm transition-all hover:shadow-md">
                <div className="mb-8">
                   <h3 className="text-xl font-black text-slate-900 leading-tight">État Portefeuille</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vue d'ensemble par Statut</p>
                </div>
                <div className="h-64 relative">
                   <Doughnut 
                     data={{
                       labels: ['En attente', 'Confirmées', 'En location'],
                       datasets: [{
                         data: [data.reservations.pending, data.reservations.confirmed, data.reservations.activeRentals],
                         backgroundColor: ['#fcd34d', '#10b981', '#ef4444'],
                         borderWidth: 0,
                         borderRadius: 8,
                         hoverOffset: 15,
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
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Ops.</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Standardized Table for Operations */}
             <div className="bg-white rounded-[3.5rem] p-10 border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden relative">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">Activités Logistiques</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suivi des derniers mouvements</p>
                   </div>
                   <Link href="/operations/reservations">
                      <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 hover:text-red-700 h-10 px-4 rounded-xl border-none">Voir tout</Button>
                   </Link>
                </div>
                <div className="-mx-4">
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
                                <span className="text-xs font-bold text-slate-700">{formatDate(res.pickupDate)}</span>
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

             {/* Strategic Oversight Dark Box */}
             <div className="rounded-[3.5rem] bg-slate-900 border border-slate-800 p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] -mr-48 -mb-48 transition-all duration-1000 group-hover:bg-red-600/20"></div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                   <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 mb-8 backdrop-blur-sm">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20"></span>
                         <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Live Insights • Carlaville</span>
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tighter mb-6 leading-tight">Plan d'Action <br/><span className="text-blue-500">Logistique</span></h3>
                      
                      <div className="grid grid-cols-2 gap-6 my-10">
                         <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Impact Journée</span>
                            <span className="text-3xl font-black text-white">{data.reservations.todayPickups + data.reservations.todayReturns}</span>
                            <span className="text-[10px] font-bold text-white/20 block mt-1">Actions attendues</span>
                         </div>
                         <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1">Rendement Fleet</span>
                            <span className="text-3xl font-black text-white">{Math.round((data.reservations.activeRentals / (data.reservations.activeRentals + data.maintenance.inProgressCars + 5)) * 100)}%</span>
                            <span className="text-[10px] font-bold text-white/20 block mt-1">Disponibilité réelle</span>
                         </div>
                      </div>

                      <p className="text-white/40 text-sm font-medium leading-relaxed max-w-sm">
                         La charge opérationnelle actuelle est stable. Concentrez l'équipe sur les **{data.reservations.todayPickups} départs** critiques prévus avant midi.
                      </p>
                   </div>
                   <div className="mt-12 flex items-center gap-6">
                      <Link href="/operations/reservations" className="group/btn h-14 pr-8 pl-6 rounded-2xl bg-white flex items-center justify-center font-black text-neutral-900 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/20">
                         Tableau de Bord Complet
                         <ArrowRight size={18} className="ml-3 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-8 mt-6">
            <div className="flex items-center gap-3 ml-2">
               <h2 className="text-xl font-black tracking-tight text-slate-900">Navigation Rapide</h2>
               <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <QuickCard 
                 title="Gestion Flotte"
                 desc="Suivi technique & Maintenance"
                 icon={<Wrench size={24}/>}
                 href="/operations/maintenance"
                 color="text-amber-600 bg-amber-50 border-amber-100"
               />
               <QuickCard 
                 title="Feuilles de Route"
                 desc="Planning départs & retours"
                 icon={<Calendar size={24}/>}
                 href="/operations/reservations"
                 color="text-blue-600 bg-blue-50 border-blue-100"
               />
               <QuickCard 
                 title="Rapports d'Activité"
                 desc="Historique des mouvements"
                 icon={<FileText size={24}/>}
                 href="/operations/reservations"
                 color="text-purple-600 bg-purple-50 border-purple-100"
               />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const OPCard = ({ label, value, icon, hint, color, trend, subValue, isWarning }: any) => {
  const colors = {
    emerald: 'from-emerald-50 to-emerald-100/50 text-emerald-600 border-emerald-100 shadow-emerald-100/20',
    amber: 'from-amber-50 to-amber-100/50 text-amber-600 border-amber-100 shadow-amber-100/20',
    blue: 'from-blue-50 to-blue-100/50 text-blue-600 border-blue-100 shadow-blue-100/20',
    red: 'from-rose-50 to-rose-100/50 text-rose-600 border-rose-100 shadow-rose-100/20',
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl group relative overflow-hidden flex flex-col justify-between h-56">
       <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-1000 group-hover:scale-150"></div>
       
       <div className="flex items-center justify-between relative z-10">
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
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

const QuickCard = ({ title, desc, icon, href, color }: any) => (
  <Link href={href} className="group bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-6">
     <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center border shadow-sm transition-all group-hover:scale-110 group-hover:rotate-6", color)}>
        {icon}
     </div>
     <div>
        <h4 className="text-sm font-black text-slate-900 tracking-tight">{title}</h4>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-tight">{desc}</p>
     </div>
     <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
        <ArrowRight size={18} className="text-red-500" />
     </div>
  </Link>
);
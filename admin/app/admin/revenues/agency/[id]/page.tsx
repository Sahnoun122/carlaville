'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAgencies } from '@/features/agencies/services/agency-service';
import { getTimeframeAnalytics, getRevenues } from '@/features/revenues/services/revenue-service';
import { Button } from '@/components/ui/button';
import { RevenueDashboardCards } from '@/features/revenues/components/revenue-dashboard-cards';
import { RevenueTable } from '@/features/revenues/components/revenue-table';
import { ArrowLeft, Building2, Calendar, Target, ShieldCheck, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AgencyRevenuePage() {
  const params = useParams();
  const router = useRouter();
  const agencyId = params.id as string;

  // Fetch Agency Details
  const { data: agenciesData } = useQuery({
    queryKey: ['agencies'],
    queryFn: () => getAgencies({ page: 1, limit: 100 }),
  });

  const agency = agenciesData?.agencies?.find((a: any) => a._id === agencyId || a.id === agencyId);

  // Fetch Filtered Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['revenue-timeframe-analytics', agencyId],
    queryFn: () => getTimeframeAnalytics(agencyId),
  });

  // Fetch Filtered Revenues for the table
  const { data: revenuesData, isLoading: revenuesLoading } = useQuery({
    queryKey: ['revenues', { agencyId }],
    queryFn: () => getRevenues({ agencyId }),
  });

  if (!agency && !statsLoading) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
           <Building2 size={32} />
        </div>
        <p className="text-slate-500 font-medium italic">Agence non trouvée ou chargement des données...</p>
        <Button onClick={() => router.back()} variant="outline" className="rounded-xl">Retour au Hub</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
            className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-600 h-10 w-10 p-0"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
              <Building2 size={28} />
            </div>
            <div>
              <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                <span>Finances</span>
                <span className="text-slate-200">/</span>
                <span>Agences</span>
                <span className="text-slate-200">/</span>
                <span className="text-indigo-600 font-black">Détails</span>
              </nav>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                {agency?.name || 'Chargement...'}
                <span className="text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
                  {agency?.city}
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-slate-200 gap-2 font-bold text-slate-600">
            <Download size={18} />
            Exporter Rapport
          </Button>
          <Button className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 gap-2 px-6 text-white">
            <Calendar size={18} />
            Période
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Target className="text-indigo-400" size={20} />
              </div>
              <h3 className="font-black text-lg uppercase tracking-wider">Pilotage Agence</h3>
            </div>
            <p className="text-indigo-100/60 text-sm font-medium leading-relaxed max-w-sm">
              Vue consolidée des performances financières. La répartition <span className="text-white font-bold underline decoration-indigo-500 decoration-2 underline-offset-4">85% Agence / 15% Plateforme</span> est appliquée en temps réel.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300">
              <span>Commission Plateforme</span>
              <span className="bg-indigo-500 text-white px-2 py-0.5 rounded">15%</span>
            </div>
            <div className="text-3xl font-black">{new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format((stats?.thisMonth?.total || 0) * 0.15)}</div>
            <p className="text-[10px] font-medium text-white/40">Gains estimés sur le mois en cours</p>
          </div>

          <div className="flex flex-col justify-center gap-2 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-400">
              <span>Revenu Net Agence</span>
              <span className="bg-emerald-500 text-white px-2 py-0.5 rounded">85%</span>
            </div>
            <div className="text-3xl font-black text-emerald-400">{new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(stats?.thisMonth?.net || 0)}</div>
            <p className="text-[10px] font-medium text-white/40">Montant total à reverser à l'agence</p>
          </div>
        </div>
      </div>

      {/* Analytics Cards (Reusable) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            <ShieldCheck size={18} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Indicateurs de Performance</h2>
        </div>
        <RevenueDashboardCards agencyId={agencyId} />
      </div>

      {/* Full Transaction History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
              <Calendar size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Journal des Revenus</h2>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          {revenuesLoading ? (
            <div className="h-64 flex items-center justify-center animate-pulse bg-slate-50 italic text-slate-400">Chargement du journal...</div>
          ) : (
            <RevenueTable revenues={revenuesData?.revenues || []} />
          )}
        </div>
      </div>
    </div>
  );
}

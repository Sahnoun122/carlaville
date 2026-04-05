'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRevenues,
  type Revenue,
} from '@/features/revenues/services/revenue-service';
import { RevenueTable } from './revenue-table';
import { RevenueRankings } from './revenue-rankings';
import { TurnoverManagement } from './turnover-management';
import { Button } from '@/components/ui/button';
import { Search, DollarSign, RefreshCcw, ShieldCheck, LayoutDashboard, ListFilter, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAgencies } from '@/features/agencies/services/agency-service';

export const RevenueManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'performance'>('overview');
  const [page] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['revenues', page, searchTerm, selectedAgency],
    queryFn: () => getRevenues({ agencyId: selectedAgency || undefined }),
    enabled: activeTab === 'journal',
  });

  const { data: agenciesData } = useQuery({
    queryKey: ['agencies-filter'],
    queryFn: () => getAgencies({ page: 1, limit: 100 }),
  });

  const filteredRevenues = data?.revenues?.filter((rev: Revenue) => {
      const searchMatch = searchTerm ? 
        rev.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        rev.amount.toString().includes(searchTerm) : true;
      return searchMatch;
  });

  const totalRevenue = filteredRevenues?.reduce((acc: number, curr: Revenue) => acc + curr.amount, 0) || 0;

  const tabs = [
    { id: 'overview', label: 'Aperçu Global', icon: LayoutDashboard },
    { id: 'journal', label: 'Journal des Recettes', icon: ListFilter },
    { id: 'performance', label: 'Performances', icon: Trophy },
  ] as const;

  return (
    <div className="w-full space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <DollarSign size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Gestion Revenus
            </h1>
          </div>
          <p className="text-slate-500 font-medium">
            Tableau de bord financier centralisé pour le suivi automatique des revenus.
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 font-bold text-xs uppercase tracking-widest shadow-sm">
          <ShieldCheck size={16} />
          Données Certifiées
        </div>
      </div>

      {/* Financial Split Banner */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200 mb-8">
         <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full -mr-32 -mt-32 opacity-50"></div>
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                     <TrendingUp size={20} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight uppercase">Pilotage Financier</h2>
               </div>
               <p className="text-slate-400 text-sm font-medium max-w-lg leading-relaxed">
                  Répartition automatique des revenus : <span className="text-white font-black underline decoration-indigo-500 decoration-2 underline-offset-4">85%</span> pour l'agence partenaire et <span className="text-white font-black underline decoration-amber-500 decoration-2 underline-offset-4">15%</span> de commission plateforme Carlaville.
               </p>
            </div>
            <div className="flex gap-4">
               <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-4 rounded-3xl text-center min-w-[120px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Part Agence</p>
                  <p className="text-xl font-black text-indigo-400 italic">Variable</p>
               </div>
               <div className="bg-amber-500 p-4 rounded-3xl text-center min-w-[120px] text-amber-950 shadow-xl shadow-amber-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Plateforme</p>
                  <p className="text-xl font-black italic">Dynamique</p>
               </div>
            </div>
         </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-sm rounded-2xl border border-slate-200 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                isActive 
                  ? "bg-white text-indigo-600 shadow-md ring-1 ring-slate-200" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
              )}
            >
              <Icon size={18} className={cn(isActive ? "text-indigo-600" : "text-slate-400")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 transition-all duration-500">
        {activeTab === 'overview' && (
          <div className="animate-in slide-in-from-bottom-2 duration-500">
             <TurnoverManagement />
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
             {/* Journal Controls */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                  <input
                    type="text"
                    placeholder="Rechercher par référence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 shadow-sm transition-all focus:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </div>

              <div className="relative group">
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 shadow-sm transition-all focus:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-50 appearance-none"
                >
                  <option value="">Toutes les agences</option>
                  {agenciesData?.agencies?.map((agency: any) => (
                    <option key={agency.id || agency._id} value={agency.id || agency._id}>{agency.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <RefreshCcw size={16} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Total filtré</p>
                    <p className="text-lg font-black text-slate-900">
                      {new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(totalRevenue)}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isRefetching} className="h-10 w-10 rounded-xl p-0">
                  <RefreshCcw size={16} className={cn(isRefetching && "animate-spin")} />
                </Button>
              </div>
            </div>

            {isLoading && !isRefetching ? (
               <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50">
                  <RefreshCcw className="h-8 w-8 animate-spin text-indigo-400" />
               </div>
            ) : (
               <RevenueTable revenues={filteredRevenues || []} />
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="animate-in slide-in-from-bottom-2 duration-500">
             <RevenueRankings />
          </div>
        )}
      </div>
    </div>
  );
};

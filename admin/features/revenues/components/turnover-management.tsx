'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTurnoverBreakdown } from '@/features/revenues/services/revenue-service';
import { getAgencies } from '@/features/agencies/services/agency-service';
import { Building2, CarFront, DollarSign, Trophy, TrendingUp, TrendingDown, RefreshCcw, LayoutDashboard, Eye, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RevenueDashboardCards } from './revenue-dashboard-cards';
import Link from 'next/link';

export const TurnoverManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: breakdowns, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['turnover-breakdown'],
    queryFn: () => getTurnoverBreakdown(),
  });

  // Filter agencies locally based on search term
  const filteredBreakdowns = breakdowns?.filter((agency: any) => 
    agency.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.agencyCity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If there's only one agency matching, effectively filter the dashboard cards too
  const matchedAgencyId = filteredBreakdowns?.length === 1 ? (filteredBreakdowns[0] as any)._id : undefined;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 text-slate-900">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
             <LayoutDashboard size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Recherche active</p>
            <h3 className="text-sm font-black tracking-tight italic">Aperçu Global {searchTerm && `pour "${searchTerm}"`}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
           <div className="relative w-full group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
             <input 
               type="text"
               placeholder="Rechercher une agence ou une ville..."
               className="h-12 w-full pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-indigo-50 transition-all shadow-inner"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <Button variant="outline" size="sm" onClick={() => refetch()} className="h-12 w-12 rounded-2xl border-slate-100 p-0 text-slate-400 hover:text-indigo-600">
             <RefreshCcw size={18} className={cn(isRefetching && "animate-spin")} />
           </Button>
        </div>
      </div>

      <RevenueDashboardCards agencyId={matchedAgencyId} />

      {isLoading && !isRefetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"></div>
           ))}
        </div>
      ) : isError ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-rose-100 bg-rose-50 text-center p-6">
          <p className="text-rose-600 font-medium">Une erreur est survenue lors du chargement du Chiffre d'Affaires.</p>
        </div>
      ) : filteredBreakdowns?.length === 0 ? (
         <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50">
           <Search className="w-12 h-12 text-slate-300 mb-4" />
           <p className="text-slate-500 font-medium italic">Aucune agence pour "{searchTerm}"</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {(filteredBreakdowns as any[])?.map((agency, index) => {
            // Re-calculate totals
            const totalGross = agency.totalAgencyRevenue || 0;
            const totalComm = agency.totalAgencyCommission || (totalGross * 0.15);
            const totalNet = agency.totalAgencyNet || (totalGross - totalComm);

            return (
              <div key={agency._id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                
                {/* Agency Card - Optimized Vertical Layout */}
                <div className="relative p-7 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/40 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  
                  <div className="relative z-10 flex flex-col gap-6">
                    
                    {/* Top Row: Agency Info & Button */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
                          <Building2 size={26} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{agency.agencyName}</h2>
                          <div className="flex items-center gap-2 mt-1.5 font-bold text-blue-600 uppercase tracking-widest text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            {agency.agencyCity}
                          </div>
                        </div>
                      </div>

                      <Link href={`/admin/revenues/agency/${agency._id}`}>
                        <Button className="h-10 px-5 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95 group">
                          <Eye size={16} className="group-hover:scale-110 transition-transform" />
                          Détails
                        </Button>
                      </Link>
                    </div>

                    {/* Bottom Row: Financial Stats under the name */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50/80 px-5 py-4 rounded-3xl border border-slate-100/50 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Chiffre d'Affaire Brut</p>
                        <p className="text-xl font-black text-slate-800 leading-none">{formatCurrency(totalGross)}</p>
                      </div>
                      <div className="bg-rose-50/50 px-5 py-4 rounded-3xl border border-rose-100/50 flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 italic">Commission Plateforme (15%)</p>
                        <p className="text-xl font-black text-rose-600 leading-none">-{formatCurrency(totalComm)}</p>
                      </div>
                      <div className="bg-emerald-50/60 px-5 py-4 rounded-3xl border border-emerald-100 flex flex-col justify-center shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 font-bold whitespace-nowrap">Net Revenu Agence (85%)</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-black text-emerald-700 leading-none tracking-tight">{formatCurrency(totalNet)}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { getRevenueRankings, RankingAgency, RankingCar } from '../services/revenue-service';
import { Trophy, CarFront, Building2, TrendingUp, AlertCircle } from 'lucide-react';

export const RevenueRankings = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['revenue-rankings'],
    queryFn: getRevenueRankings,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 animate-pulse">
        <div className="h-80 bg-slate-50 rounded-3xl border border-slate-100"></div>
        <div className="h-80 bg-slate-50 rounded-3xl border border-slate-100"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mt-12 bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-start gap-3">
        <AlertCircle className="text-rose-500 w-5 h-5 shrink-0" />
        <p className="text-sm font-medium text-rose-700">Impossible de charger les classements pour le moment.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgressWidth = (current: number, max: number) => {
    if (!max || max === 0) return '0%';
    return `${Math.max(5, (current / max) * 100)}%`;
  };

  const topCarRevenue = data.topCars[0]?.totalRevenue || 1;
  const topAgencyRevenue = data.topAgencies[0]?.totalRevenue || 1;

  const podiumColors = ['bg-amber-400', 'bg-slate-300', 'bg-orange-400']; // Gold, Silver, Bronze
  const defaultColor = 'bg-slate-200';

  return (
    <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top Voitures */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-slate-50/80 p-5 sm:p-6 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Trophy size={20} className="fill-orange-500/20" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-lg">Top Véhicules</h3>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Générateurs de revenus</p>
            </div>
          </div>
          <CarFront className="text-slate-200 w-12 h-12 self-end sm:self-auto" />
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-5">
           {data.topCars.length === 0 ? (
             <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400 italic">Aucune donnée disponible.</div>
           ) : (
             data.topCars.map((car, index) => {
               const barColor = index < 3 ? podiumColors[index] : defaultColor;
               const badgeStyle = index === 0 
                ? "bg-amber-100 text-amber-700 ring-4 ring-amber-50" 
                : index === 1 
                ? "bg-slate-100 text-slate-700 ring-4 ring-slate-50"
                : index === 2
                ? "bg-orange-100 text-orange-700 ring-4 ring-orange-50"
                : "bg-slate-50 text-slate-500";

               return (
                 <div key={car._id} className="flex flex-col gap-4 sm:flex-row sm:items-center group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${badgeStyle}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between mb-1.5">
                        <span className="font-bold text-slate-900 truncate text-sm">{car.name}</span>
                        <span className="font-black text-slate-900 text-sm ml-2 shrink-0">{formatCurrency(car.totalRevenue)}</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 ${barColor}`} 
                          style={{ width: calculateProgressWidth(car.totalRevenue, topCarRevenue) }}
                        ></div>
                      </div>
                    </div>
                 </div>
               );
             })
           )}
        </div>
      </div>

      {/* Top Agences */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-slate-50/80 p-5 sm:p-6 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <TrendingUp size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-lg">Performance Agences</h3>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Classement général</p>
            </div>
          </div>
          <Building2 className="text-slate-200 w-12 h-12 self-end sm:self-auto" />
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-5">
           {data.topAgencies.length === 0 ? (
             <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400 italic">Aucune donnée disponible.</div>
           ) : (
             data.topAgencies.map((agency, index) => {
                const barColor = index === 0 ? 'bg-indigo-500' : index === 1 ? 'bg-indigo-400' : index === 2 ? 'bg-indigo-300' : 'bg-slate-200';
                const badgeStyle = index < 3 ? 'bg-indigo-50 text-indigo-700 font-black' : 'bg-slate-50 text-slate-500 font-bold';

               return (
                 <div key={agency._id} className="flex flex-col gap-4 sm:flex-row sm:items-center group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${badgeStyle}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between mb-1.5">
                        <span className="font-bold text-slate-900 truncate text-sm">
                          {agency.name} 
                          <span className="text-[10px] font-medium text-slate-400 ml-2 uppercase tracking-wide">{agency.city}</span>
                        </span>
                        <span className="font-black text-indigo-950 text-sm ml-2 shrink-0">{formatCurrency(agency.totalRevenue)}</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 ${barColor}`} 
                          style={{ width: calculateProgressWidth(agency.totalRevenue, topAgencyRevenue) }}
                        ></div>
                      </div>
                    </div>
                 </div>
               );
             })
           )}
        </div>
      </div>

    </div>
  );
};

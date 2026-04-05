'use client';

import { useQuery } from '@tanstack/react-query';
import { getTimeframeAnalytics } from '../services/revenue-service';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevenueDashboardCardsProps {
  agencyId?: string;
  agency?: any;
}

export const RevenueDashboardCards = ({ agencyId, agency }: RevenueDashboardCardsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['revenue-timeframe-analytics', agencyId],
    queryFn: () => getTimeframeAnalytics(agencyId),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"></div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: "Aujourd'hui",
      value: stats?.today.total || 0,
      net: stats?.today.net || 0,
      previous: stats?.yesterday.total || 0,
      icon: Clock,
      color: "blue"
    },
    {
      label: "Cette Semaine",
      value: stats?.thisWeek.total || 0,
      net: stats?.thisWeek.net || 0,
      icon: Calendar,
      color: "emerald"
    },
    {
      label: "Ce Mois",
      value: stats?.thisMonth.total || 0,
      net: stats?.thisMonth.net || 0,
      icon: BarChart3,
      color: "indigo"
    },
    {
      label: "Cette Année",
      value: stats?.thisYear.total || 0,
      net: stats?.thisYear.net || 0,
      icon: DollarSign,
      color: "slate"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, idx) => {
          const trend = kpi.previous !== undefined ? calculateTrend(kpi.value, kpi.previous) : null;
        
          const commissionRate = agency?.commissionRate ?? 15;
          const agencyRate = 100 - commissionRate;
          const platformAmount = kpi.value * (commissionRate / 100);
          const agencyAmount = kpi.value - platformAmount;

        return (
          <div key={idx} className="group relative bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-50 transition-colors"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-3 rounded-2xl shrink-0",
                  kpi.color === 'blue' && "bg-blue-50 text-blue-600",
                  kpi.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                  kpi.color === 'indigo' && "bg-indigo-50 text-indigo-600",
                  kpi.color === 'slate' && "bg-slate-900 text-white"
                )}>
                  <kpi.icon size={20} />
                </div>
                
                {trend !== null && (
                  <div className={cn(
                    "flex items-center gap-0.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border",
                    trend >= 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                  )}>
                    {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(Math.round(trend))}%
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</p>
                <div className="flex flex-col">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(kpi.value)}</h3>
                   
                   <div className="mt-3 space-y-1.5 pt-3 border-t border-slate-50">
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Agence ({agencyRate}%)</span>
                         <span className="text-xs font-black text-emerald-600">{formatCurrency(agencyAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Plateforme</span>
                         <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-1 rounded-sm">{commissionRate}%</span>
                            <span className="text-xs font-black text-amber-600">{formatCurrency(platformAmount)}</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

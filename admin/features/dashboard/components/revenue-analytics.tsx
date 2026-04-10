'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { getRevenueAnalytics } from '@/features/reservations/services/reservation-service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const RevenueAnalytics = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['revenue-analytics'],
    queryFn: getRevenueAnalytics,
  });

  if (isLoading) return <div className="h-96 flex items-center justify-center bg-white rounded-[3rem] animate-pulse border border-gray-100 shadow-sm font-black text-gray-300 uppercase tracking-widest text-xs px-6 text-center">Chargement de l'analyse...</div>;
  if (!data) return null;

  const chartData = period === 'monthly' ? data.monthly : data.weekly;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#171717',
        titleFont: { size: 10, weight: 'bold' as const },
        bodyFont: { size: 12, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y.toLocaleString()} MAD`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.02)', drawBorder: false },
        ticks: { 
          font: { weight: 'bold' as const, size: 10 }, 
          color: '#94a3b8',
          callback: (value: any) => value >= 1000 ? (value / 1000) + 'k' : value
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { weight: 'bold' as const, size: 10 }, color: '#94a3b8' }
      }
    }
  };

  const lineData = {
    labels: chartData.map(d => d.label),
    datasets: [
      {
        fill: true,
        label: 'Revenu',
        data: chartData.map(d => d.amount),
        borderColor: '#ef4444',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          return gradient;
        },
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
      }
    ]
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <KPICard 
          title="Revenu Total" 
          value={`${data.summary.totalRevenue.toLocaleString()} MAD`} 
          icon={<Wallet className="w-6 h-6" />}
          trend={data.summary.growth}
          color="red"
        />
        <KPICard 
          title="Panier Moyen" 
          value={`${Math.round(data.summary.avgBookingValue).toLocaleString()} MAD`} 
          icon={<DollarSign className="w-6 h-6" />}
          color="blue"
        />
        <KPICard 
          title="Volume Réservations" 
          value={data.summary.totalBookings.toString()} 
          icon={<ShoppingBag className="w-6 h-6" />}
          color="emerald"
        />
        <KPICard 
          title="Performance" 
          value={`${data.summary.growth}%`} 
          icon={<TrendingUp className="w-6 h-6" />}
          color="amber"
          isTrendOnly
        />
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 sm:p-8 lg:p-14 rounded-[4rem] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50/30 rounded-full blur-[100px] -mr-64 -mt-64 transition-all duration-1000 group-hover:bg-red-50/50"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10 lg:mb-16 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.5)]"></span>
              <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.4em]">Analyse Financière</h3>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tighter leading-tight">
              Évolution des <span className="text-red-600">Revenus</span>
            </h2>
          </div>
          
          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-6">
            <button 
              onClick={() => refetch()}
              className="self-start p-3 text-gray-300 hover:text-red-600 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="flex w-full bg-neutral-50 p-1.5 rounded-2xl border border-neutral-100 sm:w-auto">
              <button 
                onClick={() => setPeriod('weekly')}
                className={`flex-1 sm:flex-none px-5 sm:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === 'weekly' ? 'bg-white text-red-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Semaine
              </button>
              <button 
                onClick={() => setPeriod('monthly')}
                className={`flex-1 sm:flex-none px-5 sm:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === 'monthly' ? 'bg-white text-red-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Mois
              </button>
            </div>
          </div>
        </div>

        <div className="h-[320px] sm:h-[380px] lg:h-[450px] w-full relative z-10">
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, trend, color, isTrendOnly }: any) => {
  const colors = {
    red: 'bg-red-50 text-red-600 border-red-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[3rem] border border-gray-100 shadow-sm group hover:-translate-y-2 hover:shadow-xl transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 rounded-full blur-2xl -mr-12 -mt-12 transition-all duration-500 group-hover:scale-150"></div>
      
      <div className="flex flex-col gap-6 sm:gap-8 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colors[color as keyof typeof colors]}`}>
          {icon}
        </div>
        
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">{title}</p>
          <div className="flex items-baseline gap-4">
             <h4 className="text-3xl lg:text-4xl font-black text-neutral-900 tracking-tighter leading-none">{value}</h4>
             {!isTrendOnly && trend !== undefined && (
               <div className={`flex items-center text-[10px] font-black px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                 {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                 {Math.abs(trend)}%
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

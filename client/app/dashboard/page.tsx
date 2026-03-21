"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Calendar, 
  MapPin, 
  Car, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

export default function DashboardPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('carlaville_user');
    if (userData) setUser(JSON.parse(userData));

    async function fetchReservations() {
      const token = localStorage.getItem('carlaville_token');
      try {
        const res = await fetch('http://localhost:3009/api/client/reservations?limit=100', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setReservations(data.reservations || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReservations();
  }, []);

  const stats = useMemo(() => {
    const totalSpent = reservations.reduce((acc, res) => {
      const amount = res.pricingBreakdown?.total || (res.pricingBreakdown?.daily * res.rentalDays) || 0;
      return acc + amount;
    }, 0);

    const activeStatuses = ['ready-for-delivery', 'in-delivery', 'delivered', 'active-rental'];
    const active = reservations.filter(res => activeStatuses.includes(res.status)).length;
    
    const statusCounts = reservations.reduce((acc: any, res) => {
      acc[res.status] = (acc[res.status] || 0) + 1;
      return acc;
    }, {});

    return { total: reservations.length, active, totalSpent, statusCounts };
  }, [reservations]);

  const chartData = useMemo(() => {
    const doughnutData = {
      labels: ['Confirmées', 'En attente', 'Terminées', 'Annulées'],
      datasets: [
        {
          data: [
            stats.statusCounts['confirmed'] || 0,
            stats.statusCounts['pending'] || 0,
            stats.statusCounts['completed'] || 0,
            (stats.statusCounts['cancelled'] || 0) + (stats.statusCounts['rejected'] || 0),
          ],
          backgroundColor: [
            '#ef4444', // red-500
            '#fcd34d', // amber-300
            '#10b981', // emerald-500
            '#9ca3af', // gray-400
          ],
          borderWidth: 0,
          hoverOffset: 4
        },
      ],
    };

    return { doughnutData };
  }, [stats]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-8 border-red-50 rounded-full"></div>
        <div className="absolute inset-0 border-8 border-red-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Carlaville Expérience</p>
    </div>
  );

  const lastReservation = reservations.length > 0 ? reservations[0] : null;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-1000">
      
      {/* Premium Header Container */}
      <div className="relative overflow-hidden group">
        {/* Background Layer */}
        <div className="absolute inset-0 bg-neutral-900 rounded-[3.5rem] shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-red-600/30 transition-all duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10 p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-8 transition-transform hover:scale-105 cursor-default">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Membre Privilégié</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter mb-6 leading-none">
              Bonjour, <br className="hidden lg:block" /><span className="text-red-600">{user?.name?.split(' ')[0]}</span>
            </h1>
            
            <p className="text-white/60 text-lg lg:text-xl font-medium max-w-xl leading-relaxed md:ml-1">
              Pilotez vos prochaines aventures avec une interface conçue pour l'excellence.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6 shrink-0">
            <Link href="/cars" className="group relative bg-white text-neutral-900 font-black px-12 py-7 rounded-[2rem] transition-all hover:scale-105 hover:-translate-y-1 active:scale-95 shadow-2xl overflow-hidden">
               <div className="absolute inset-0 bg-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <span className="relative z-10 flex items-center gap-4 text-lg">
                  Réserver un véhicule <ArrowUpRight className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
               </span>
            </Link>
            
            <div className="flex items-center gap-8 text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">
               <div className="flex items-center gap-2 group-hover:text-white/50 transition-colors"><Clock className="w-4 h-4" /> 24/7 Support</div>
               <div className="w-1 h-1 bg-white/20 rounded-full"></div>
               <div className="flex items-center gap-2 group-hover:text-white/50 transition-colors"><MapPin className="w-4 h-4" /> 12 Agences</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Stats & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Stats Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card: Total Reservations */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-red-500/5 transition-all duration-700">
            <div className="absolute top-0 right-0 p-10 text-neutral-50 transform rotate-12 group-hover:rotate-0 transition-transform duration-1000">
               <Calendar className="w-40 h-40" />
            </div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100 mb-8 transition-transform group-hover:rotate-6">
                <Calendar className="w-7 h-7" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Activité Totale</p>
              <h3 className="text-6xl font-black text-neutral-900 tracking-tighter mb-4">{stats.total}</h3>
              <p className="text-sm font-bold text-gray-500 leading-relaxed max-w-[200px]">Réservations enregistrées dans votre historique.</p>
              
              <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Stable</span>
                </div>
                <Link href="/dashboard/reservations" className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">Consulter →</Link>
              </div>
            </div>
          </div>

          {/* Card: Active Rentals */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-red-500/5 transition-all duration-700">
            <div className="absolute top-0 right-0 p-10 text-neutral-50 transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
               <Car className="w-40 h-40" />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-neutral-900/20 mb-8 group-hover:bg-red-600 transition-colors">
                <Car className="w-7 h-7" />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Location Active</p>
              <h3 className="text-6xl font-black text-neutral-900 tracking-tighter mb-4">{stats.active}</h3>
              <p className="text-sm font-bold text-gray-500 leading-relaxed max-w-[200px]">Véhicules actuellement sous votre responsabilité.</p>

              <div className="mt-12 pt-8 border-t border-gray-50 flex items-center gap-4">
                 <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-neutral-900 border-2 border-white flex items-center justify-center text-[8px] font-black text-white uppercase">Live</div>
                 </div>
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Suivi GPS Actif</span>
              </div>
            </div>
          </div>

          {/* Card: Total Invested (MAD) */}
          <div className="md:col-span-2 bg-neutral-900 p-10 lg:p-14 rounded-[4rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-red-600/20 transition-all duration-1000"></div>
             
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                <div className="flex items-start lg:items-center gap-8">
                   <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-white border border-white/10 group-hover:bg-red-600 group-hover:border-red-500 transition-all duration-500 shadow-inner">
                      <Wallet className="w-10 h-10" />
                   </div>
                   <div>
                      <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] mb-2">Compte Carlaville</p>
                      <h3 className="text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                        {stats.totalSpent.toLocaleString()} <span className="text-xl font-black text-red-500 ml-1 uppercase">MAD</span>
                      </h3>
                      <p className="text-white/30 text-xs font-bold mt-4 italic">Cumul des investissements de mobilité</p>
                   </div>
                </div>
                
                <div className="flex flex-col items-center md:items-end gap-3">
                   <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Paiements Sécurisés</span>
                   </div>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Dernière facture : 28/05</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-4 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] flex flex-col items-center justify-between">
          <div className="w-full">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-[11px] font-black text-neutral-900 uppercase tracking-[0.3em]">État de la Flotte</h3>
               <AlertCircle className="w-5 h-5 text-neutral-200" />
            </div>
            
            <div className="relative w-full aspect-square flex items-center justify-center">
               <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-5xl font-black text-neutral-900 tabular-nums">{stats.total}</span>
                  <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.3em]">Total</span>
               </div>
               <Doughnut 
                 data={chartData.doughnutData} 
                 options={{
                   cutout: '82%',
                   responsive: true,
                   maintainAspectRatio: true,
                   plugins: { 
                     legend: { display: false },
                     tooltip: {
                       backgroundColor: '#171717',
                       titleFont: { size: 10, weight: 'bold' },
                       bodyFont: { size: 12, weight: '900' },
                       padding: 12,
                       cornerRadius: 12,
                       displayColors: false
                     }
                   },
                   animation: { animateRotate: true, duration: 2500, easing: 'easeOutQuart' }
                 }} 
               />
            </div>
          </div>

          <div className="w-full space-y-4 mt-12">
             {chartData.doughnutData.labels.map((label, idx) => (
                <div key={label} className="flex items-center justify-between p-4 rounded-[1.5rem] border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full shadow-sm group-hover:scale-125 transition-transform" style={{ backgroundColor: chartData.doughnutData.datasets[0].backgroundColor[idx] }}></div>
                      <span className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">{label}</span>
                   </div>
                   <div className="text-xs font-black text-neutral-900 bg-neutral-50 px-3 py-1 rounded-lg border border-neutral-100">{chartData.doughnutData.datasets[0].data[idx]}</div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Section: Recent Activity */}
      <div className="space-y-10 pt-10">
        <div className="flex items-end justify-between border-b-2 border-neutral-50 pb-8">
          <div>
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white transform rotate-6 shadow-xl shadow-red-600/20">
                   <TrendingUp className="w-5 h-5" />
                </div>
                <h2 className="text-4xl font-black text-neutral-900 tracking-tighter">Journal d'activité</h2>
             </div>
             <p className="text-neutral-400 font-medium text-sm ml-1">Consultez les détails de votre dernière opération.</p>
          </div>
          <Link href="/dashboard/reservations" className="group flex flex-col items-end gap-1">
             <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] group-hover:text-neutral-900 transition-colors">Explorer tout</span>
             <div className="h-1 w-12 bg-red-100 group-hover:w-20 transition-all rounded-full group-hover:bg-red-600"></div>
          </Link>
        </div>

        {lastReservation ? (
          <div className="bg-white rounded-[4rem] border border-gray-100 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08)] p-10 lg:p-14 flex flex-col lg:flex-row gap-12 items-center group hover:-translate-y-2 transition-all duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/30 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-red-50/50 transition-all duration-1000"></div>
              
              <div className="w-full lg:w-72 h-48 bg-gray-50 rounded-[3rem] flex items-center justify-center p-10 border border-neutral-100 group-hover:bg-white group-hover:border-red-100 group-hover:scale-[1.02] transition-all duration-1000 overflow-hidden shrink-0 shadow-inner">
                  {(lastReservation.carId?.images?.[0] || lastReservation.carId?.imageUrl) ? (
                    <img src={lastReservation.carId?.images?.[0] || lastReservation.carId?.imageUrl} alt="Car" className="max-w-full max-h-full object-contain filter drop-shadow-2xl transition-transform group-hover:scale-110 duration-1000" />
                  ) : <Car className="w-20 h-20 text-neutral-100" />}
              </div>
              
              <div className="flex-1 w-full space-y-8 relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></span>
                        <span className="text-[11px] font-black text-red-600 uppercase tracking-[0.4em]">{lastReservation.status}</span>
                      </div>
                      <h3 className="text-4xl lg:text-5xl font-black text-neutral-900 tracking-tighter leading-tight">
                        {lastReservation.carId?.brand} <span className="text-red-600">{lastReservation.carId?.model}</span>
                      </h3>
                    </div>
                    <div className="bg-neutral-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center shrink-0">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-1">Dossier Réf.</p>
                        <p className="text-lg font-mono font-black text-red-600">{lastReservation.bookingReference}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pt-10 border-t border-neutral-50">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] flex items-center gap-3"><Calendar className="w-4 h-4" /> Durée Location</p>
                        <p className="text-base font-black text-neutral-900">{new Date(lastReservation.pickupDate).toLocaleDateString()} — {new Date(lastReservation.returnDate).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] flex items-center gap-3"><MapPin className="w-4 h-4" /> Prise en charge</p>
                        <p className="text-base font-black text-neutral-900">{lastReservation.pickupLocation}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] flex items-center gap-3"><Wallet className="w-4 h-4" /> Investissement</p>
                        <p className="text-xl font-black text-red-600">{(lastReservation.pricingBreakdown?.total || 0).toLocaleString()} <span className="text-xs">MAD</span></p>
                      </div>
                  </div>
              </div>
          </div>
        ) : (
          <div className="p-32 text-center bg-gray-50 rounded-[4rem] border-4 border-dashed border-neutral-100 group hover:border-red-100 transition-colors">
             <AlertCircle className="w-16 h-16 text-neutral-200 mx-auto mb-6 group-hover:text-red-100 transition-colors" />
             <p className="text-neutral-300 font-black uppercase tracking-[0.4em] text-xs">Aucune activité enregistrée.</p>
             <Link href="/cars" className="inline-flex mt-8 text-neutral-900 font-black border-b-2 border-neutral-900 pb-1 hover:text-red-600 hover:border-red-600 transition-all">Commencez l'aventure →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

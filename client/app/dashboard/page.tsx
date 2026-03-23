"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  History as HistoryIcon, 
  MapPin, 
  Car, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  ChevronRight,
  Loader2,
  TrendingUp,
  Wallet,
  LogOut,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, BarElement, Title, PointElement, LineElement
);

export default function DashboardPage() {
  const router = useRouter();
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
          headers: { 'Authorization': `Bearer ${token}` }
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

  const handleLogout = () => {
    localStorage.removeItem('carlaville_token');
    localStorage.removeItem('carlaville_user');
    router.push('/');
  };

  const stats = useMemo(() => {
    const totalSpent = reservations.reduce((acc, res) => acc + (res.pricingBreakdown?.total || 0), 0);
    const active = reservations.filter(res => ['confirmed', 'active-rental', 'in-delivery'].includes(res.status)).length;
    return { total: reservations.length, active, totalSpent };
  }, [reservations]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chargement du tableau de bord...</p>
    </div>
  );

  const lastReservation = reservations[0];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12 animate-fade-in">
      
      {/* Simple Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-12 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-red-50 rounded border border-red-100">Compte Client</span>
             <button onClick={handleLogout} className="text-[10px] font-bold text-gray-400 hover:text-primary uppercase tracking-widest flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5" /> Déconnexion
             </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {user?.name?.split(' ')[0]}</h1>
          <p className="text-gray-500 text-sm mt-1">Gérez vos réservations et vos préférences.</p>
        </div>
        <Link href="/cars" className="btn-premium flex items-center gap-2 text-sm">
           <Plus className="w-4 h-4" /> Nouvelle réservation
        </Link>
      </div>

      {/* Basic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard icon={<Calendar className="w-5 h-5" />} label="Total réservations" value={stats.total} />
        <StatsCard icon={<Car className="w-5 h-5" />} label="Locations actives" value={stats.active} />
        <StatsCard icon={<Wallet className="w-5 h-5" />} label="Total investi" value={`${stats.totalSpent.toLocaleString()} MAD`} />
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 italic">Dernière activité</h3>
            <Link href="/dashboard/reservations" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">Tout voir</Link>
         </div>

         {lastReservation ? (
           <div className="bg-white p-6 rounded-2xl border border-gray-100 soft-shadow flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-48 h-32 bg-gray-50 rounded-xl flex items-center justify-center p-4 shrink-0">
                 {(lastReservation.carId?.images?.[0] || lastReservation.carId?.imageUrl) ? (
                   <img src={lastReservation.carId?.images?.[0] || lastReservation.carId?.imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                 ) : <Car className="w-10 h-10 text-gray-200" />}
              </div>
              
              <div className="flex-1 space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                       <span className="text-[10px] font-bold text-primary uppercase px-2 py-0.5 bg-red-50 rounded mb-1 inline-block">{lastReservation.status}</span>
                       <h4 className="text-xl font-bold text-gray-900">{lastReservation.carId?.brand} {lastReservation.carId?.model}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase"># {lastReservation.bookingReference}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                       <p className="text-gray-400 font-bold uppercase text-[9px]">Dates</p>
                       <p className="font-medium text-gray-900">{new Date(lastReservation.pickupDate).toLocaleDateString()} - {new Date(lastReservation.returnDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                       <p className="text-gray-400 font-bold uppercase text-[9px]">Lieu</p>
                       <p className="font-medium text-gray-900 truncate">{lastReservation.pickupLocation}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0">
                       <p className="text-gray-400 font-bold uppercase text-[9px]">Montant</p>
                       <p className="text-lg font-black text-primary">{(lastReservation.pricingBreakdown?.total || 0).toLocaleString()} MAD</p>
                    </div>
                 </div>
              </div>
           </div>
         ) : (
           <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 border-spacing-4 italic text-gray-400">
              Aucune activité récente.
           </div>
         )}
      </div>
    </div>
  );
}

const StatsCard = ({ icon, label, value }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 soft-shadow flex items-center gap-6">
     <div className="w-12 h-12 bg-gray-50 text-primary rounded-xl flex items-center justify-center shrink-0">
        {icon}
     </div>
     <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xl font-extrabold text-gray-900">{value}</p>
     </div>
  </div>
);

"use client";
import { useEffect, useState } from 'react';
import { Calendar, MapPin, Car } from 'lucide-react';
import Link from 'next/link';

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold animate-pulse text-lg">Initialisation de votre dashboard...</p>
    </div>
  );

  const totalSpent = reservations.reduce((acc, res) => {
    const amount = res.pricingBreakdown?.total || (res.pricingBreakdown?.daily * res.rentalDays) || 0;
    return acc + amount;
  }, 0);

  const activeStatuses = ['pending', 'ready-for-delivery', 'in-delivery', 'delivered', 'active-rental', 'return-scheduled'];
  const activeReservationsList = reservations.filter(res => activeStatuses.includes(res.status));
  
  const lastReservation = reservations.length > 0 ? reservations[0] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border-b-4 border-b-red-600">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Content de vous revoir !</p>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-4">Bonjour, {user?.name?.split(' ')[0]} <span className="animate-pulse">👋</span></h1>
            <p className="text-gray-400 text-lg font-medium max-w-xl leading-relaxed">Prêt pour votre prochaine destination ? Retrouvez ici le résumé de vos activités chez Carlaville.</p>
          </div>
          <Link href="/cars" className="bg-gray-900 text-white font-black px-12 py-6 rounded-2xl hover:bg-black transition-all shadow-2xl hover:-translate-y-1 flex items-center gap-3">
             Nouvelle réservation <Car className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col items-center text-center group hover:bg-red-50 transition-all">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-white group-hover:scale-110 transition-all">
             <Calendar className="w-8 h-8 text-gray-400 group-hover:text-red-500" />
          </div>
          <span className="text-5xl font-black text-gray-900 tracking-tighter mb-2 group-hover:text-red-700">{reservations.length}</span>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Réservations</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col items-center text-center group hover:bg-red-50 transition-all border-t-4 border-t-red-600">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100 group-hover:bg-white group-hover:scale-110 transition-all">
             <Car className="w-8 h-8 text-gray-400 group-hover:text-red-500" />
          </div>
          <span className="text-5xl font-black text-red-600 tracking-tighter mb-2">{activeReservationsList.length}</span>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Locations Actives</p>
        </div>

        <div className="bg-gray-900 p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col items-center text-center group hover:scale-[1.02] transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mt-16"></div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-white/20 transition-all">
             <MapPin className="w-8 h-8 text-white/50" />
          </div>
          <span className="text-4xl font-black text-white tracking-tighter mb-2">{totalSpent.toLocaleString()}</span>
          <p className="text-xs font-black text-white/40 uppercase tracking-widest">Montant Total Invesit (MAD)</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Récent</h2>
          <Link href="/dashboard/reservations" className="text-red-600 font-black text-sm uppercase tracking-widest hover:underline">Voir tout →</Link>
        </div>

        {lastReservation ? (
          <div className="bg-white rounded-3xl border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.04)] p-6 flex flex-col lg:flex-row gap-8 items-center lg:items-center group hover:bg-red-50 transition-all">
              <div className="w-full lg:w-40 h-28 bg-gray-50 rounded-2xl flex items-center justify-center p-3 border border-gray-100 group-hover:bg-white transition-all overflow-hidden shrink-0">
                  {(lastReservation.carId?.images?.[0] || lastReservation.carId?.imageUrl) ? (
                    <img src={lastReservation.carId?.images?.[0] || lastReservation.carId?.imageUrl} alt="Car" className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110 duration-500" />
                  ) : <Car className="w-10 h-10 text-gray-200" />}
              </div>
              <div className="flex-1 w-full text-center lg:text-left">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-1">• Dernière Activité : {lastReservation.status}</span>
                  <h3 className="text-xl font-black text-gray-900 mb-3">{lastReservation.carId?.brand} <span className="text-red-600">{lastReservation.carId?.model}</span></h3>
                  <div className="flex justify-center lg:justify-start gap-10">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Période</p>
                        <p className="text-xs font-bold text-gray-900">{new Date(lastReservation.pickupDate).toLocaleDateString()} - {new Date(lastReservation.returnDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Réf</p>
                        <p className="text-xs font-bold text-gray-900">{lastReservation.bookingReference}</p>
                      </div>
                  </div>
              </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
             <p className="text-gray-400 font-bold italic">Aucune activité récente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState, useMemo } from 'react';
import { Calendar, MapPin, Car, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
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

  const filteredReservations = useMemo(() => {
    return reservations.filter(res => {
      const matchesSearch = 
        res.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.carId?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.carId?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, statusFilter]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold animate-pulse text-lg">Préparation de vos réservations...</p>
    </div>
  );

  const statuses = Array.from(new Set(reservations.map(res => res.status)));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Mes Réservations</h1>
          <p className="text-gray-500 text-xl font-medium max-w-2xl">Gérez l'ensemble de vos locations et suivez leur état en temps réel.</p>
        </div>
        <Link href="/cars" className="bg-red-600 text-white font-black px-8 py-4 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 shrink-0">
           Nouvelle réservation
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par référence, voiture ou ville..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-medium text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-gray-50 pl-4 pr-2 rounded-2xl border-none">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            className="bg-transparent border-none py-3 pr-8 focus:ring-0 font-bold text-gray-700 text-sm uppercase tracking-wider cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reservations List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Résultats</h2>
          <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">{filteredReservations.length} Entrées</span>
        </div>
      
        {filteredReservations.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Aucun résultat trouvé</h2>
            <p className="text-gray-500 mb-0 text-sm max-w-md mx-auto font-medium">Essayez de modifier vos filtres ou votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredReservations.map((res: any) => (
              <div key={res._id} className="bg-white rounded-[2rem] border border-gray-50 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all overflow-hidden group">
                <div className="p-6 md:p-7 flex flex-col lg:flex-row gap-8">
                  {/* Car Image Preview */}
                  <div className="w-full lg:w-48 h-36 bg-gray-50 rounded-2xl flex items-center justify-center p-4 border border-gray-100 relative group-hover:bg-white group-hover:border-red-50 transition-all overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/[0.02] transition-colors"></div>
                    {(res.carId?.images?.[0] || res.carId?.imageUrl) ? (
                      <img src={res.carId?.images?.[0] || res.carId?.imageUrl} alt="Car" className="max-w-full max-h-full object-contain relative z-10 transition-transform group-hover:scale-110 duration-500" />
                    ) : (
                      <Car className="w-12 h-12 text-gray-200 relative z-10" />
                    )}
                  </div>

                  {/* Info Content */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                            ['pending', 'rejected', 'cancelled'].includes(res.status) ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                            ['confirmed', 'active-rental', 'completed', 'delivered', 'returned', 'ready-for-delivery', 'in-delivery'].includes(res.status) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            'bg-gray-50 text-gray-500 border border-gray-200'
                          }`}>
                            • Statut : {res.status}
                          </span>
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">Réf# {res.bookingReference}</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{res.carId?.brand} <span className="text-red-600">{res.carId?.model}</span></h3>
                        <p className="text-gray-400 font-bold text-xs mt-1">Ville : {res.carId?.city || 'Maroc'}</p>
                      </div>
                      
                      <div className="text-left md:text-right bg-gray-50 rounded-2xl p-4 border border-gray-100 group-hover:bg-red-50 group-hover:border-red-100 transition-colors">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-red-400 transition-colors">Paiement Total</p>
                        <div className="flex items-baseline gap-1 md:justify-end">
                           <span className="text-2xl font-black text-gray-900 group-hover:text-red-700 transition-colors">{(res.pricingBreakdown?.total || (res.pricingBreakdown?.daily * res.rentalDays) || 0).toLocaleString()}</span>
                           <span className="text-[10px] font-black text-gray-400 group-hover:text-red-400 transition-colors tracking-widest font-mono">MAD</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-0.5">
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all flex items-center justify-center border border-gray-100 group-hover:border-red-50 shrink-0">
                          <MapPin className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Prise en charge</p>
                          <p className="text-xs font-bold text-gray-900 mb-0.5">{res.pickupLocation}</p>
                          <p className="text-[10px] font-bold text-gray-500">{new Date(res.pickupDate).toLocaleDateString()} à <span className="text-gray-900">{res.pickupTime}</span></p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all flex items-center justify-center border border-gray-100 group-hover:border-red-50 shrink-0">
                          <MapPin className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Retour prévu</p>
                          <p className="text-xs font-bold text-gray-900 mb-0.5">{res.returnLocation}</p>
                          <p className="text-[10px] font-bold text-gray-500">{new Date(res.returnDate).toLocaleDateString()} à <span className="text-gray-900">{res.returnTime}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status Bar Footer */}
                <div className="h-1.5 w-full bg-gray-50">
                   <div 
                     className={`h-full transition-all duration-1000 ${
                       res.status === 'pending' ? 'w-1/4 bg-orange-400' :
                       res.status === 'confirmed' ? 'w-1/2 bg-emerald-400' :
                       res.status === 'active-rental' ? 'w-3/4 bg-red-600' :
                       ['completed', 'returned'].includes(res.status) ? 'w-full bg-red-600' :
                       'w-full bg-gray-300'
                     }`}
                   ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

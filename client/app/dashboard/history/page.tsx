"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  History as HistoryIcon, 
  MapPin, 
  Car, 
  Search, 
  Filter, 
  ArrowRight,
  ChevronRight,
  Clock,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
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

  const historyStatuses = ['rejected', 'completed', 'confirmed', 'cancelled', 'returned'];
  
  const filteredHistory = useMemo(() => {
    return reservations
      .filter(res => historyStatuses.includes(res.status))
      .filter(res => {
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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-8 border-red-50 rounded-full"></div>
        <div className="absolute inset-0 border-8 border-red-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Carlaville Archivage</p>
    </div>
  );

  const statuses = Array.from(new Set(reservations.filter(res => historyStatuses.includes(res.status)).map(res => res.status)));

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-1000">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-neutral-900 rounded-[3.5rem] shadow-2xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-red-600/20 transition-all duration-1000"></div>
        </div>

        <div className="relative z-10 p-12 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-6 transition-transform hover:scale-105 cursor-default text-white/40">
               <ShieldCheck className="w-3 h-3" />
               <span className="text-[9px] font-black uppercase tracking-widest">Opérations Sécurisées</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter mb-4 leading-tight">Historique <span className="text-red-600">Complet</span></h1>
            <p className="text-white/50 text-lg font-medium max-w-xl leading-relaxed">
              Consultez l'ensemble de vos aventures passées et téléchargez vos documents de location.
            </p>
          </div>
          <Link href="/cars" className="group relative bg-red-600 text-white font-black px-10 py-6 rounded-[2rem] transition-all hover:scale-105 active:scale-95 shadow-2xl overflow-hidden shrink-0">
               <div className="absolute inset-0 bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <span className="relative z-10 flex items-center gap-3">
                  Réserver à nouveau <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
               </span>
          </Link>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-red-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher dans les archives..." 
            className="w-full pl-16 pr-6 py-4 bg-gray-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-red-500/20 transition-all font-bold text-neutral-900 placeholder:text-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 bg-gray-50 pl-6 pr-3 rounded-[1.5rem] border border-transparent focus-within:ring-2 focus-within:ring-red-500/20">
          <Filter className="w-5 h-5 text-gray-300" />
          <select 
            className="bg-transparent border-none py-4 pr-10 focus:ring-0 font-black text-neutral-600 text-[11px] uppercase tracking-widest cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Filtre Statut</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Archive List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <HistoryIcon className="w-4 h-4 text-red-600" />
              <h2 className="text-xl font-black text-neutral-900 tracking-tight">Archives <span className="text-gray-300 font-bold ml-1">({filteredHistory.length})</span></h2>
           </div>
           <div className="h-px flex-1 mx-8 bg-neutral-50 hidden sm:block"></div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-white p-24 rounded-[4rem] border-4 border-dashed border-neutral-50 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 text-neutral-200 rounded-[2rem] flex items-center justify-center mb-8">
              <HistoryIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-neutral-900 mb-3 tracking-tight">Aucun enregistrement</h2>
            <p className="text-gray-400 max-w-md mx-auto font-medium text-sm leading-relaxed">Votre historique est actuellement vide ou aucun élément ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            {filteredHistory.map((res: any) => (
              <div key={res._id} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_70px_-20px_rgba(0,0,0,0.08)] transition-all duration-700 overflow-hidden group hover:-translate-y-1">
                <div className="p-8 lg:p-10 flex flex-col lg:flex-row gap-10 lg:items-center">
                  
                  {/* Vehicle Image */}
                  <div className="w-full lg:w-64 h-44 bg-gray-50 rounded-[2.5rem] flex items-center justify-center p-8 border border-neutral-100 group-hover:bg-white transition-all duration-700 overflow-hidden shrink-0 shadow-inner filter grayscale group-hover:grayscale-0">
                    {(res.carId?.images?.[0] || res.carId?.imageUrl) ? (
                      <img src={res.carId?.images?.[0] || res.carId?.imageUrl} alt="Car" className="max-w-full max-h-full object-contain relative z-10 transition-transform group-hover:scale-110 duration-700" />
                    ) : (
                      <Car className="w-16 h-16 text-neutral-100 relative z-10" />
                    )}
                  </div>

                  {/* Main Detail Content */}
                  <div className="flex-1 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${
                            ['returned', 'completed'].includes(res.status) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            'bg-orange-50 text-orange-600 border border-orange-100'
                          }`}>
                            {res.status}
                          </span>
                          <span className="text-[10px] font-mono font-black text-gray-300 uppercase tracking-widest leading-none">Réf# {res.bookingReference}</span>
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-black text-neutral-900 tracking-tighter leading-none group-hover:text-red-600 transition-colors">
                          {res.carId?.brand} {res.carId?.model}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-xs bg-gray-50 px-3 py-1.5 rounded-xl self-start">
                           <MapPin className="w-3.5 h-3.5 text-red-500" /> {res.carId?.city || 'Maroc'}
                        </div>
                      </div>
                      
                      <div className="text-right bg-neutral-900 px-8 py-5 rounded-[2rem] shadow-xl group-hover:shadow-red-600/20 transition-all duration-500 shrink-0 self-center md:self-auto min-w-[200px]">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-1">Total Transaction</p>
                        <div className="flex items-baseline justify-center md:justify-end gap-1.5">
                           <span className="text-3xl font-black text-white">{(res.pricingBreakdown?.total || (res.pricingBreakdown?.daily * res.rentalDays) || 0).toLocaleString()}</span>
                           <span className="text-[10px] font-black text-red-500 tracking-[0.2em]">MAD</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Event Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-neutral-50 group-hover:border-red-50/50 transition-colors">
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-2xl bg-neutral-50 group-hover:bg-white transition-all flex items-center justify-center border border-neutral-100 group-hover:border-red-50 shrink-0">
                          <Clock className="w-5 h-5 text-neutral-300 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Prise en charge</p>
                          <p className="text-xs font-black text-neutral-900">{res.pickupLocation}</p>
                          <p className="text-[10px] font-bold text-gray-500">{new Date(res.pickupDate).toLocaleDateString()} — <span className="text-neutral-900">{res.pickupTime}</span></p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-2xl bg-neutral-50 group-hover:bg-white transition-all flex items-center justify-center border border-neutral-100 group-hover:border-red-50 shrink-0">
                          <Calendar className="w-5 h-5 text-neutral-300 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Retour Effectué</p>
                          <p className="text-xs font-black text-neutral-900">{res.returnLocation}</p>
                          <p className="text-[10px] font-bold text-gray-500">{new Date(res.returnDate).toLocaleDateString()} — <span className="text-neutral-900">{res.returnTime}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Archive Status Strip */}
                <div className="h-1.5 w-full bg-neutral-900 flex group-hover:bg-red-600 transition-colors">
                   <div className="h-full w-full opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

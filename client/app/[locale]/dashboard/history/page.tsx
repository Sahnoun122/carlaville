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
  Loader2
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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';
        const res = await fetch(`${API_URL}/api/client/reservations?limit=100`, {
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
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chargement de l'historique...</p>
    </div>
  );

  const statuses = Array.from(new Set(reservations.filter(res => historyStatuses.includes(res.status)).map(res => res.status)));

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in">

      {/* Simple Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Historique de location</h1>
        <p className="text-gray-500 mt-1 text-sm font-medium">Consultez vos anciennes réservations et activités passées.</p>
      </div>

      {/* Control Bar */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 soft-shadow flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans l'historique..."
            className="input-premium pl-11 py-2.5 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="input-premium py-2.5 text-sm appearance-none cursor-pointer"
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

      {/* Results */}
      {filteredHistory.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-2xl border border-gray-100 soft-shadow">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <HistoryIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Historique vide</h3>
          <p className="text-gray-500 text-sm">Vous n'avez pas encore de réservations passées.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((res: any) => (
            <div key={res._id} className="bg-gray-50 rounded-xl border border-gray-200 soft-shadow overflow-hidden group hover:bg-white transition-all">
              <div className="p-5 flex flex-col md:flex-row gap-6 md:items-center">

                {/* Car Image Monochrome-ish */}
                <div className="w-full md:w-32 h-24 md:h-20 bg-white rounded-lg flex items-center justify-center p-3 border border-gray-100 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity shadow-sm">
                  {(res.carId?.images?.[0] || res.carId?.imageUrl) ? (
                    <img src={res.carId?.images?.[0] || res.carId?.imageUrl} className="max-w-full max-h-full object-contain filter grayscale" alt="" />
                  ) : <Car className="w-6 h-6 text-gray-200" />}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${['returned', 'completed'].includes(res.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                      {res.status}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">#{res.bookingReference}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {res.carId?.brand} {res.carId?.model}
                  </h3>

                  <div className="flex flex-wrap gap-4 mt-2">
                    <p className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {res.pickupLocation}
                    </p>
                    <p className="text-[10px] font-medium text-gray-500 flex items-center gap-1 border-l pl-4">
                      <Calendar className="w-3 h-3" /> {new Date(res.pickupDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="md:text-right pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                  <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Total payé</p>
                  <p className="text-lg font-bold text-gray-900">{(res.pricingBreakdown?.total || 0).toLocaleString()} MAD</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


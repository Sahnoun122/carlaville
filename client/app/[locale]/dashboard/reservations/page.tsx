"use client";

import { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Car,
  Search,
  Filter,
  Clock,
  ChevronRight,
  Loader2,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import ReservationDetailModal from '@/components/ReservationDetailModal';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chargement de vos réservations...</p>
    </div>
  );

  const statuses = Array.from(new Set(reservations.map(res => res.status)));

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in">

      {/* Simple Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mes réservations</h1>
          <p className="text-gray-500 mt-1 text-sm">Gérez vos locations en cours et à venir.</p>
        </div>
        <Link href="/cars" className="btn-premium flex items-center gap-2 text-[11px] uppercase tracking-widest px-6 py-4 w-full md:w-auto justify-center">
          <Plus className="w-4 h-4" /> Nouvelle réservation
        </Link>
      </div>

      {/* Control Bar */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 soft-shadow flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une réservation..."
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
      {filteredReservations.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-2xl border border-gray-100 soft-shadow">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Aucune réservation trouvée</h3>
          <p className="text-gray-500 text-sm">Essayez d'ajuster vos filtres de recherche.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReservations.map((res: any) => (
            <div key={res._id} className="bg-gray-50 rounded-2xl border border-gray-100 soft-shadow overflow-hidden group hover:border-red-100 transition-all">
              <div className="p-5 md:p-6 flex flex-col lg:flex-row gap-6 lg:items-center">

                {/* Car Image Small */}
                <div className="w-full lg:w-40 h-32 lg:h-28 bg-white rounded-xl flex items-center justify-center p-4 border border-gray-100 shrink-0 shadow-sm">
                  {(res.carId?.images?.[0] || res.carId?.imageUrl) ? (
                    <img src={res.carId?.images?.[0] || res.carId?.imageUrl} className="max-w-full max-h-full object-contain" alt="" />
                  ) : <Car className="w-8 h-8 text-gray-200" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${['pending', 'rejected', 'cancelled'].includes(res.status) ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      ['confirmed', 'active-rental', 'completed', 'delivered', 'returned', 'ready-for-delivery', 'in-delivery'].includes(res.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                      {res.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Ref: {res.bookingReference}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 truncate">
                    {res.carId?.brand} {res.carId?.model}
                  </h3>

                  <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4">
                    <InfoItem icon={<MapPin className="w-3.5 h-3.5" />} text={res.pickupLocation} />
                    <InfoItem icon={<Calendar className="w-3.5 h-3.5" />} text={new Date(res.pickupDate).toLocaleDateString()} />
                    <InfoItem icon={<Clock className="w-3.5 h-3.5" />} text={res.pickupTime} />
                  </div>
                </div>

                {/* Price & Action */}
                <div className="lg:text-right flex lg:flex-col justify-between items-center lg:items-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Montant total</p>
                    <p className="text-xl font-bold text-gray-900">{(res.pricingBreakdown?.total || (res.pricingBreakdown?.daily * res.rentalDays) || 0).toLocaleString()} MAD</p>
                  </div>
                  {['pending', 'unpaid'].includes(res.status) ? (
                    <Link href={`/checkout/${res._id}`} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-wider">
                      Finaliser <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => { setSelectedReservation(res); setIsModalOpen(true); }}
                      className="text-xs font-black text-neutral-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-1 uppercase tracking-wider transition-all"
                    >
                      Suivi <ChevronRight className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReservationDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reservation={selectedReservation}
      />
    </div>
  );
}

const InfoItem = ({ icon, text }: any) => (
  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
    <div className="text-gray-300">{icon}</div>
    {text}
  </div>
);


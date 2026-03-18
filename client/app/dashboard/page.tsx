"use client";
import { useEffect, useState } from 'react';
import { Calendar, MapPin, Car } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservations() {
      const token = localStorage.getItem('carlaville_token');
      try {
        const res = await fetch('http://localhost:3000/client/reservations', {
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

  if (loading) return <div className="text-lg text-gray-500 font-semibold animate-pulse">Chargement de vos réservations...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Mes Réservations</h1>
      <p className="text-gray-500 mb-10 text-lg">Suivez l'état de vos locations actuelles et passées.</p>
      
      {reservations.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-gray-100 text-center shadow-sm">
          <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Aucune réservation</h2>
          <p className="text-gray-500 mb-8 text-lg">Vous n'avez pas encore effectué de réservation avec Carlaville.</p>
          <Link href="/cars" className="inline-block bg-primary text-white font-bold px-8 py-4 rounded-xl hover:bg-primary-hover transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform">Explorer nos véhicules</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reservations.map((res: any) => (
            <div key={res._id} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col lg:flex-row gap-8 items-center lg:items-start group">
              <div className="w-full lg:w-48 h-32 bg-gray-50 rounded-2xl flex items-center justify-center p-4 border border-gray-100 group-hover:border-primary/20 transition-colors">
                {res.carId?.imageUrl ? (
                  <img src={res.carId.imageUrl} alt="Car" className="max-w-full max-h-full object-contain" />
                ) : (
                  <Car className="w-16 h-16 text-gray-300" />
                )}
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      res.status === 'PENDING' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                      res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 border border-green-200' :
                      res.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {res.status}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-4">{res.carId?.brand} {res.carId?.model}</h3>
                    <p className="text-sm font-semibold text-gray-400 mt-1">Réf: {res.bookingReference}</p>
                  </div>
                  <div className="text-left md:text-right bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Montant total</p>
                    <span className="text-2xl font-extrabold text-primary">{res.pricingBreakdown?.total || (res.pricingBreakdown?.daily * res.rentalDays) || 0} MAD</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Départ: {res.pickupLocation}</p>
                      <p className="text-sm font-medium text-gray-500">{new Date(res.pickupDate).toLocaleDateString()} à {res.pickupTime}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Retour: {res.returnLocation}</p>
                      <p className="text-sm font-medium text-gray-500">{new Date(res.returnDate).toLocaleDateString()} à {res.returnTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

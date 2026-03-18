"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReservationForm({ car }: { car: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('carlaville_token');
    if (!token) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const formData = new FormData(e.currentTarget);
    const pickupDate = formData.get('pickupDate') as string;
    const returnDate = formData.get('returnDate') as string;
    const pickupTime = formData.get('pickupTime') as string;
    const returnTime = formData.get('returnTime') as string;
    const pickupLocation = formData.get('pickupLocation') as string;
    const returnLocation = formData.get('returnLocation') as string;
    const customerPhone = formData.get('customerPhone') as string;

    const payload = {
      carId: car._id,
      agencyId: car.agencyId?._id || car.agencyId,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      pickupLocation,
      returnLocation,
      customerPhone,
      customerName: 'Client', // Set by backend if missing, but validator requires string
      customerEmail: 'ignore@email.com', // JWT overrides
      selectedExtras: [],
      pricingBreakdown: { daily: car.dailyPrice }
    };

    try {
      const res = await fetch('http://localhost:3000/client/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de la réservation');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  // Calculate dates for min limits
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-red-900/5 p-8 border-t-4 border-t-primary sticky top-24">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Réserver ce véhicule</h3>
      
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 font-medium p-4 rounded-xl text-center">
          <p className="font-bold text-lg mb-2">🎉 Réservation confirmée !</p>
          <p className="text-sm">Vous allez être redirigé vers votre tableau de bord...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="bg-red-50 text-primary p-3 rounded-lg text-sm font-semibold">{error}</div>}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Lieu de départ</label>
            <input required name="pickupLocation" type="text" defaultValue={car.city} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Lieu de retour</label>
            <input required name="returnLocation" type="text" defaultValue={car.city} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date départ</label>
              <input required name="pickupDate" type="date" min={today} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Heure</label>
              <input required name="pickupTime" type="time" defaultValue="10:00" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date retour</label>
              <input required name="returnDate" type="date" min={today} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Heure</label>
              <input required name="returnTime" type="time" defaultValue="10:00" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
            <input required name="customerPhone" type="tel" placeholder="+212 6..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100 flex justify-between items-center mb-6">
            <span className="font-semibold text-gray-500">Tarif journalier</span>
            <span className="font-extrabold text-2xl text-primary">{car.dailyPrice} MAD</span>
          </div>

          {isClient && !localStorage.getItem('carlaville_token') && (
            <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-xs mb-4">
              Vous devez être connecté pour réserver. Vous serez redirigé.
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
          >
            {loading ? 'Traitement...' : 'Confirmer la Réservation'}
          </button>
        </form>
      )}
    </div>
  );
}

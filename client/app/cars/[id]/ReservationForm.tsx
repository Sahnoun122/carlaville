"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ReservationExtraOption = {
  id: string;
  label: string;
  price: number;
  billingType: 'PER_DAY' | 'PER_RENTAL';
  scope: 'ALL_CARS' | 'SELECTED_CARS';
  carIds?: string[];
  active?: boolean;
};

interface DayControlSettings {
  minRentalDays: number;
  maxRentalDays: number;
  maxAdvanceBookingDays: number;
  allowSameDayBooking: boolean;
  extras?: ReservationExtraOption[];
}

const toPositiveInt = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  const parsed = Math.floor(value);
  return parsed > 0 ? parsed : undefined;
};

const formatDate = (value: Date) => value.toISOString().split('T')[0];

const addDaysToDateString = (dateString: string, days: number) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

export default function ReservationForm({ car }: { car: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<DayControlSettings | null>(null);

  // Form states for dynamic calculation
  const [pickupDate, setPickupDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});

  const carId = String(car?._id || car?.id || '');

  const carMinRentalDays = toPositiveInt(car?.minRentalDays);
  const globalMinRentalDays = Math.max(1, settings?.minRentalDays ?? 1);
  const effectiveMinRentalDays = carMinRentalDays ?? globalMinRentalDays;

  useEffect(() => {
    setIsClient(true);

    const loadDayControlSettings = async () => {
      try {
        const res = await fetch('http://localhost:3009/api/reservations/settings/day-control', {
          cache: 'no-store',
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setSettings({
          minRentalDays: data.minRentalDays,
          maxRentalDays: data.maxRentalDays,
          maxAdvanceBookingDays: data.maxAdvanceBookingDays,
          allowSameDayBooking: data.allowSameDayBooking,
          extras: data.extras || [],
        });
      } catch {
      }
    };

    loadDayControlSettings();
  }, []);

  const applicableExtras = (settings?.extras || []).filter((extra) => {
    if (extra.active === false) {
      return false;
    }

    if (extra.scope === 'ALL_CARS') {
      return true;
    }

    return (extra.carIds || []).includes(carId);
  });

  useEffect(() => {
    if (applicableExtras.length === 0) {
      setSelectedExtras({});
      return;
    }

    const allowedIds = new Set(applicableExtras.map((extra) => extra.id));
    setSelectedExtras((previous) => {
      const nextEntries = Object.entries(previous).filter(([id, isSelected]) => isSelected && allowedIds.has(id));
      return Object.fromEntries(nextEntries);
    });
  }, [carId, settings]);

  useEffect(() => {
    const today = new Date();
    const todayStr = formatDate(today);
    const minPickupDate = settings?.allowSameDayBooking
      ? todayStr
      : addDaysToDateString(todayStr, 1);
    const minDuration = effectiveMinRentalDays;

    if (!pickupDate) {
      setPickupDate(minPickupDate);
      setReturnDate(addDaysToDateString(minPickupDate, minDuration - 1));
      return;
    }

    if (pickupDate < minPickupDate) {
      setPickupDate(minPickupDate);
      setReturnDate(addDaysToDateString(minPickupDate, minDuration - 1));
      return;
    }

    if (!returnDate) {
      setReturnDate(addDaysToDateString(pickupDate, minDuration - 1));
    }
  }, [settings, pickupDate, returnDate, effectiveMinRentalDays]);

  const todayStr = formatDate(new Date());
  const minRentalDays = effectiveMinRentalDays;
  const maxRentalDays = Math.max(minRentalDays, settings?.maxRentalDays ?? 30);
  const pickupMinDate = settings?.allowSameDayBooking
    ? todayStr
    : addDaysToDateString(todayStr, 1);
  const pickupMaxDate = settings
    ? addDaysToDateString(todayStr, settings.maxAdvanceBookingDays)
    : undefined;

  const returnMinDate = pickupDate
    ? addDaysToDateString(pickupDate, minRentalDays - 1)
    : pickupMinDate;
  const returnMaxDate = pickupDate
    ? addDaysToDateString(pickupDate, maxRentalDays - 1)
    : undefined;

  const handlePickupDateChange = (value: string) => {
    setPickupDate(value);

    if (!value) {
      return;
    }

    const minAllowedReturn = addDaysToDateString(value, minRentalDays - 1);
    const maxAllowedReturn = addDaysToDateString(value, maxRentalDays - 1);

    if (!returnDate || returnDate < minAllowedReturn) {
      setReturnDate(minAllowedReturn);
      return;
    }

    if (returnDate > maxAllowedReturn) {
      setReturnDate(maxAllowedReturn);
    }
  };

  function toggleExtra(id: string) {
    setSelectedExtras(prev => ({ ...prev, [id]: !prev[id] }));
  }

  // Calculate rental days
  const d1 = new Date(pickupDate);
  const d2 = new Date(returnDate);
  let days = 1;
  if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
    const diffTime = d2.getTime() - d1.getTime();
    days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  let calendarRuleError = '';
  if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
    if (days < minRentalDays) {
      calendarRuleError = `Durée minimale autorisée: ${minRentalDays} jour(s).`;
    } else if (days > maxRentalDays) {
      calendarRuleError = `Durée maximale autorisée: ${maxRentalDays} jour(s).`;
    }
  }

  // Calculate prices
  const basePrice = car.dailyPrice * days;
  let extrasPrice = 0;
  
  const activeExtras = applicableExtras.filter(e => selectedExtras[e.id]);
  activeExtras.forEach(e => {
    extrasPrice += e.billingType === 'PER_DAY' ? e.price * days : e.price;
  });

  const totalPrice = basePrice + extrasPrice;

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
    const pickupTime = formData.get('pickupTime') as string;
    const returnTime = formData.get('returnTime') as string;
    const pickupLocation = formData.get('pickupLocation') as string;
    const returnLocation = formData.get('returnLocation') as string;

    const userData = JSON.parse(localStorage.getItem('carlaville_user') || '{}');
    const customerPhone = userData.phone || '+212600000000';

    const extrasArray = activeExtras.map((e) => e.id);
    const pricingBreakdown = {
      daily: car.dailyPrice,
      days,
      basePrice,
      extrasTotal: extrasPrice,
      total: totalPrice
    };

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
      customerName: 'Client', 
      customerEmail: 'ignore@email.com', 
      selectedExtras: extrasArray,
      pricingBreakdown
    };

    try {
      const res = await fetch('http://localhost:3009/api/client/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        const backendMessage = Array.isArray(errorData?.message)
          ? errorData.message.join(', ')
          : errorData?.message;

        throw new Error(backendMessage || 'Erreur lors de la réservation');
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

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-red-900/5 p-8 border-t-4 border-t-primary sticky top-24">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Réserver ce véhicule</h3>
      
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 font-medium p-4 rounded-xl text-center">
          <p className="font-bold text-lg mb-2">🎉 Réservation confirmée !</p>
          <p className="text-sm">Vous allez être redirigé vers votre tableau de bord...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-primary p-3 rounded-lg text-sm font-semibold">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date départ</label>
              <input required name="pickupDate" type="date" min={pickupMinDate} max={pickupMaxDate} value={pickupDate} onChange={e => handlePickupDateChange(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Heure</label>
              <input required name="pickupTime" type="time" defaultValue="10:00" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Date retour</label>
              <input required name="returnDate" type="date" min={returnMinDate} max={returnMaxDate} value={returnDate} onChange={e => setReturnDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Heure</label>
              <input required name="returnTime" type="time" defaultValue="10:00" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          </div>


          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Lieu de départ & Retour</label>
            <div className="grid grid-cols-2 gap-4">
              <input required name="pickupLocation" type="text" defaultValue={car.city} placeholder="Départ" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
              <input required name="returnLocation" type="text" defaultValue={car.city} placeholder="Retour" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          </div>

          {/* Options & Extras */}
          {applicableExtras.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-md font-bold text-gray-900 mb-3">Options & Extras</h4>
              <div className="space-y-3">
                {applicableExtras.map((extra) => (
                  <label key={extra.id} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                        checked={!!selectedExtras[extra.id]}
                        onChange={() => toggleExtra(extra.id)}
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{extra.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      +{extra.price} MAD <span className="text-gray-400 font-normal text-xs">{extra.billingType === 'PER_DAY' ? '/ jour' : '/ loc.'}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="pt-4 mt-6 border-t border-gray-200 bg-gray-50 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Location : {car.dailyPrice} MAD x {days} jour(s)</span>
              <span className="font-semibold text-gray-900">{basePrice} MAD</span>
            </div>
            {extrasPrice > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Options & Extras</span>
                <span className="font-semibold text-gray-900">+{extrasPrice} MAD</span>
              </div>
            )}
            <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total à payer</span>
              <span className="font-extrabold text-2xl text-primary">{totalPrice} MAD</span>
            </div>
          </div>

          {isClient && !localStorage.getItem('carlaville_token') && (
            <div className="bg-orange-50 text-orange-800 p-3 rounded-lg text-xs font-medium">
              Vous devez être connecté pour réserver. Vous serez redirigé.
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || Boolean(calendarRuleError)}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-hover shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? 'Traitement en cours...' : 'Confirmer au prix de ' + totalPrice + ' MAD'}
          </button>
        </form>
      )}
    </div>
  );
}

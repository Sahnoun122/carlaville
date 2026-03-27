"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

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
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
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

  const [pickupDate, setPickupDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});

  const carId = String(car?._id || car?.id || '');
  const effectiveMinRentalDays = toPositiveInt(car?.minRentalDays) ?? Math.max(1, settings?.minRentalDays ?? 1);

  useEffect(() => {
    setIsClient(true);
    const loadSettings = async () => {
      try {
        const res = await fetch('http://localhost:3009/api/reservations/settings/day-control', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setSettings({
          minRentalDays: data.minRentalDays,
          maxRentalDays: data.maxRentalDays,
          maxAdvanceBookingDays: data.maxAdvanceBookingDays,
          allowSameDayBooking: data.allowSameDayBooking,
          extras: data.extras || [],
        });
      } catch {}
    };
    loadSettings();
  }, []);

  const applicableExtras = (settings?.extras || []).filter(extra => extra.active !== false && (extra.scope === 'ALL_CARS' || (extra.carIds || []).includes(carId)));

  useEffect(() => {
    const todayStr = formatDate(new Date());
    const minPickup = settings?.allowSameDayBooking ? todayStr : addDaysToDateString(todayStr, 1);
    if (!pickupDate || pickupDate < minPickup) {
      setPickupDate(minPickup);
      setReturnDate(addDaysToDateString(minPickup, effectiveMinRentalDays));
    }
  }, [settings, effectiveMinRentalDays]);

  const pickupMinDate = settings?.allowSameDayBooking ? formatDate(new Date()) : addDaysToDateString(formatDate(new Date()), 1);
  const returnMinDate = pickupDate ? addDaysToDateString(pickupDate, effectiveMinRentalDays) : pickupMinDate;

  const handlePickupChange = (val: string) => {
    setPickupDate(val);
    const minReturn = addDaysToDateString(val, effectiveMinRentalDays);
    if (!returnDate || returnDate < minReturn) setReturnDate(minReturn);
  };

  const d1 = new Date(pickupDate);
  const d2 = new Date(returnDate);
  let days = 1;
  if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
    const diff = d2.getTime() - d1.getTime();
    days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const basePrice = car.dailyPrice * days;
  let extrasPrice = 0;
  applicableExtras.filter(e => selectedExtras[e.id]).forEach(e => {
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
    const payload = {
      carId: car._id,
      agencyId: car.agencyId?._id || car.agencyId,
      pickupDate, returnDate,
      pickupTime: formData.get('pickupTime'),
      returnTime: formData.get('returnTime'),
      pickupLocation: formData.get('pickupLocation'),
      returnLocation: formData.get('returnLocation'),
      customerPhone: JSON.parse(localStorage.getItem('carlaville_user') || '{}').phone,
      selectedExtras: applicableExtras.filter(e => selectedExtras[e.id]).map(e => e.id),
      pricingBreakdown: { daily: car.dailyPrice, days, basePrice, extrasTotal: extrasPrice, total: totalPrice }
    };

    try {
      const res = await fetch('http://localhost:3009/api/client/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Erreur réseau');
      const data = await res.json();
      setSuccess(true);
      setTimeout(() => router.push(`/checkout/${data._id || data.id}`), 800);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 soft-shadow p-6 lg:p-8 animate-fade-in">
      <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">Réserver maintenant</h3>
      
      {success ? (
         <div className="py-10 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
            <p className="font-bold text-gray-900">Réservation créée !</p>
            <p className="text-xs text-gray-400 mt-2">Chargement du paiement...</p>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold text-center border border-red-100">{error}</div>}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Prise en charge</label>
                <input required name="pickupDate" type="date" min={pickupMinDate} value={pickupDate} onChange={e => handlePickupChange(e.target.value)} className="input-premium py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Heure</label>
                <input required name="pickupTime" type="time" defaultValue="10:00" className="input-premium py-2 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Restitution</label>
                <input required name="returnDate" type="date" min={returnMinDate} value={returnDate} onChange={e => setReturnDate(e.target.value)} className="input-premium py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Heure</label>
                <input required name="returnTime" type="time" defaultValue="10:00" className="input-premium py-2 text-sm" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Lieu de départ</label>
              <input required name="pickupLocation" type="text" defaultValue={car.city} className="input-premium py-2 text-sm" />
              <input type="hidden" name="returnLocation" value={car.city} />
            </div>
          </div>

          {applicableExtras.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Options supplémentaires</p>
              <div className="space-y-2">
                {applicableExtras.map((extra) => (
                  <label key={extra.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white cursor-pointer hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={!!selectedExtras[extra.id]} 
                        onChange={() => setSelectedExtras(p => ({...p, [extra.id]: !p[extra.id]}))}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-bold text-gray-700">{extra.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{extra.price} MAD</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 space-y-3">
             <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                <span className="text-gray-400 font-medium">Prix total ({days}j) :</span>
                <span className="text-2xl font-black text-primary">{totalPrice} MAD</span>
             </div>
             <button type="submit" disabled={loading} className="btn-premium w-full flex items-center justify-center gap-2">
                {loading ? '...' : `Valider pour ${totalPrice} MAD`}
             </button>
          </div>
          
          <p className="text-[10px] text-gray-400 text-center font-medium">Paiement sécurisé par SSL</p>
        </form>
      )}
    </div>
  );
}

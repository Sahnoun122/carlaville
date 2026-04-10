"use client";
import { useEffect, useState, use } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  Lock, 
  CreditCard, 
  Handshake, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  CircleDollarSign,
  ChevronRight,
  Info,
  ArrowRight,
  Car as CarIcon,
  Fuel,
  Settings,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

const getRentalDays = (reservation: any) => {
   if (typeof reservation?.rentalDays === 'number' && Number.isFinite(reservation.rentalDays)) {
      return reservation.rentalDays;
   }

   const pickup = new Date(reservation?.pickupDate);
   const returnDate = new Date(reservation?.returnDate);

   if (Number.isNaN(pickup.getTime()) || Number.isNaN(returnDate.getTime())) {
      return 1;
   }

   const diff = returnDate.getTime() - pickup.getTime();
   return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const getBasePrice = (reservation: any, rentalDays: number) => {
   const daily = Number(reservation?.pricingBreakdown?.daily ?? reservation?.carId?.dailyPrice ?? 0);
   const explicitBase = Number(reservation?.pricingBreakdown?.basePrice);
   if (Number.isFinite(explicitBase)) return explicitBase;
   return daily * rentalDays;
};

const getExtrasTotal = (reservation: any) => {
   const explicitTotal = Number(reservation?.pricingBreakdown?.extrasTotal);
   if (Number.isFinite(explicitTotal)) return explicitTotal;

   const extras = reservation?.pricingBreakdown?.extras;
   if (Array.isArray(extras)) {
      return extras.reduce((sum: number, value: unknown) => sum + (Number(value) || 0), 0);
   }

   return 0;
};

const formatAmount = (value: unknown) => {
   const amount = Number(value);
   return Number.isFinite(amount) ? amount.toLocaleString() : '0';
};

const resolveReservationError = async (res: Response) => {
   try {
      const data = await res.json();
      if (typeof data?.message === 'string') {
         return data.message;
      }
   } catch {}

   if (res.status === 403) return 'Accès refusé à cette réservation.';
   if (res.status === 404) return 'Réservation non trouvée.';
   return 'Une erreur est survenue lors du chargement de la réservation.';
};

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
   const rentalDays = getRentalDays(reservation);
   const basePrice = getBasePrice(reservation, rentalDays);
   const extrasTotal = getExtrasTotal(reservation);
   const totalPrice = Number.isFinite(Number(reservation?.pricingBreakdown?.total))
      ? Number(reservation.pricingBreakdown.total)
      : basePrice + extrasTotal;

  useEffect(() => {
    async function fetchReservation() {
      const token = localStorage.getItem('carlaville_token');
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://carlaville-ykc8.vercel.app';
        const res = await fetch(`${API_URL}/api/client/reservations/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
            if (!res.ok) throw new Error(await resolveReservationError(res));
        const data = await res.json();
        setReservation(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    }
    fetchReservation();
  }, [id]);

  const handleConfirmReservation = async () => {
    setLoading(true);
    setError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://carlaville-ykc8.vercel.app';
      const res = await fetch(`${API_URL}/api/payments/confirm-pickup/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) throw new Error('Une erreur est survenue lors de la confirmation.');
      
      const data = await res.json();
      if (data.success) {
        setConfirmed(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-40 animate-pulse">
         <div className="w-16 h-16 border-8 border-red-50 border-t-red-600 rounded-full animate-spin mb-6"></div>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Chargement des détails...</p>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-20 animate-in fade-in zoom-in duration-700">
        <div className="container mx-auto px-4 max-w-2xl text-center">
           <div className="mb-10 flex justify-center">
              <div className="relative">
                 <div className="absolute inset-0 bg-emerald-100 rounded-full blur-3xl opacity-50 scale-150 animate-pulse"></div>
                 <div className="relative h-24 w-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                 </div>
              </div>
           </div>
           
           <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Réservation Confirmée !</h1>
           <p className="text-gray-500 font-bold mb-12 italic">Votre véhicule vous attend. Le paiement s'effectuera lors de la prise en charge.</p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              <DetailCard 
                icon={<MapPin className="w-5 h-5 text-primary" />} 
                title="Lieu de retrait" 
                desc={reservation?.pickupLocation}
              />
              <DetailCard 
                icon={<Calendar className="w-5 h-5 text-primary" />} 
                title="Documents requis" 
                desc="Permis + CIN / Passeport" 
              />
           </div>

           <Link href="/dashboard">
              <button className="h-14 px-10 rounded-2xl bg-gray-900 text-white font-black hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 group flex items-center justify-center mx-auto">
                Accéder à mon espace client <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-20 mt-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary mb-12 transition-colors">
           <ArrowLeft className="w-4 h-4" /> Retour au compte
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           <div className="lg:col-span-7 space-y-10">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vérification de la commande</span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-tight">Détails de votre <br/><span className="text-primary italic">Réservation</span></h1>
              </div>

              <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                 
                 <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                    <div className="w-full md:w-56 shrink-0 pt-4">
                       <img 
                         src={reservation?.carId?.images?.[0] || reservation?.carId?.imageUrl} 
                         alt={reservation?.carId?.brand} 
                         className="w-full h-auto object-contain transform group-hover:scale-110 transition-transform duration-700"
                       />
                    </div>
                    <div className="space-y-4 flex-1">
                       <h2 className="text-2xl font-black text-gray-900 tracking-tight">{reservation?.carId?.brand} {reservation?.carId?.model}</h2>
                       <div className="grid grid-cols-2 gap-4">
                          <CarFeature icon={<Settings className="w-3.5 h-3.5" />} text={reservation?.carId?.transmission} />
                          <CarFeature icon={<Fuel className="w-3.5 h-3.5" />} text={reservation?.carId?.fuelType} />
                          <CarFeature icon={<Users className="w-3.5 h-3.5" />} text={`${reservation?.carId?.seats} Places`} />
                          <CarFeature icon={<CarIcon className="w-3.5 h-3.5" />} text={reservation?.carId?.category} />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <SummaryItem label="Prise en charge" value={reservation?.pickupLocation} date={new Date(reservation?.pickupDate).toLocaleDateString()} time={reservation?.pickupTime} />
                 <SummaryItem label="Restitution" value={reservation?.returnLocation} date={new Date(reservation?.returnDate).toLocaleDateString()} time={reservation?.returnTime} />
              </div>
           </div>

           <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-primary/5 rounded-[3.5rem] blur-[60px] opacity-30 transform translate-y-10"></div>
              <div className="relative bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50">
                 <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8 italic flex items-center gap-2">
                    <CircleDollarSign className="w-5 h-5 text-primary" /> Récapitulatif financier
                 </h3>

                 <div className="space-y-6 mb-10 pb-8 border-b border-gray-50">
                    <PriceRow label={`Location (${rentalDays} jours)`} value={basePrice} />
                    {reservation?.selectedExtras?.length > 0 && (
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Extras & Services</p>
                          {reservation.selectedExtras.map((extra: string, idx: number) => (
                             <PriceRow key={idx} label={extra} value={reservation.pricingBreakdown?.extras?.[idx] || 0} isExtra />
                          ))}
                       </div>
                    )}
                    <div className="pt-4 flex justify-between items-end">
                       <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">Total à régler sur place</p>
                       <p className="text-3xl font-black text-primary tracking-tighter leading-none">
                          {formatAmount(totalPrice)} <span className="text-xs uppercase ml-1">MAD</span>
                       </p>
                    </div>
                 </div>

                 {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                       <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-2 uppercase tracking-wide">
                          <Info className="w-3 h-3" /> {error}
                       </p>
                    </div>
                 )}

                 <button 
                   onClick={handleConfirmReservation}
                   disabled={loading}
                   className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-hover shadow-xl shadow-red-200 transition-all active:scale-95 disabled:opacity-70 group flex items-center justify-center"
                 >
                    {loading ? (
                       <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                       <>Confirmer ma Réservation <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" /></>
                    )}
                 </button>

                 <div className="mt-8 flex flex-col gap-4">
                    <Benefit icon={<Handshake className="w-4 h-4" />} text="Paiement à la prise en charge" />
                    <Benefit icon={<ShieldCheck className="w-4 h-4" />} text="Confirmation instantanée" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const CarFeature = ({ icon, text }: any) => (
  <div className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-tight">
     <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">{icon}</div>
     {text}
  </div>
);

const SummaryItem = ({ label, value, date, time }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm border-b-4 border-b-primary/10">
     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{label}</p>
     <h4 className="text-lg font-black text-gray-900 mb-2 leading-none">{value}</h4>
     <div className="flex items-center gap-4 text-xs font-bold text-gray-400 italic">
        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {date}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {time}</span>
     </div>
  </div>
);

const PriceRow = ({ label, value, isExtra = false }: any) => (
  <div className={`flex justify-between items-center text-sm font-black ${isExtra ? 'text-gray-400 py-1' : 'text-gray-900'}`}>
     <span className={isExtra ? "ml-4" : ""}>{label}</span>
     <span>{value?.toLocaleString()} MAD</span>
  </div>
);

const Benefit = ({ icon, text }: any) => (
  <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center justify-center">
     <div className="text-primary">{icon}</div>
     {text}
  </div>
);

const DetailCard = ({ icon, title, desc }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-left">
     <div className="mb-4">{icon}</div>
     <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</h4>
     <p className="text-sm font-black text-gray-900">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }: any) => (
  <li className="flex gap-6 group">
     <span className="text-2xl font-black text-gray-200 group-hover:text-primary transition-colors duration-500 leading-none">{num}</span>
     <div>
        <h4 className="text-sm font-black text-gray-900 mb-1">{title}</h4>
        <p className="text-xs font-bold text-gray-400 leading-relaxed italic">{desc}</p>
     </div>
  </li>
);

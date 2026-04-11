"use client";
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Loader2, 
  Handshake, 
  CheckCircle2,
  Circle,
  Calendar, 
  Clock, 
  CircleDollarSign,
  Info,
  ArrowRight,
  Car as CarIcon,
  Fuel,
  Settings,
  Users,
  RefreshCw,
  AlertTriangle,
  Timer
} from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api-config';

type ReservationStatus =
   | 'pending'
   | 'confirmed'
   | 'rejected'
   | 'ready-for-delivery'
   | 'in-delivery'
   | 'delivered'
   | 'active-rental'
   | 'return-scheduled'
   | 'returned'
   | 'completed'
   | 'cancelled'
   | string;

interface ReservationCar {
   brand?: string;
   model?: string;
   category?: string;
   transmission?: string;
   fuelType?: string;
   seats?: number;
   imageUrl?: string;
   images?: string[];
   availabilityStatus?: 'available' | 'rented' | 'maintenance' | 'unavailable' | string;
}

interface PricingBreakdown {
   total?: number;
   daily?: number;
   basePrice?: number;
   extras?: number[];
   extrasTotal?: number;
}

interface ReservationDetails {
   _id?: string;
   id?: string;
   bookingReference?: string;
   status?: ReservationStatus;
   paymentStatus?: string;
   carId?: ReservationCar;
   rentalDays?: number;
   selectedExtras?: string[];
   pricingBreakdown?: PricingBreakdown;
   pickupLocation?: string;
   returnLocation?: string;
   pickupDate?: string;
   returnDate?: string;
   pickupTime?: string;
   returnTime?: string;
   updatedAt?: string;
}

const statusLabels: Record<string, string> = {
   pending: 'En attente',
   confirmed: 'Confirmee',
   rejected: 'Rejetee',
   'ready-for-delivery': 'Prete livraison',
   'in-delivery': 'En livraison',
   delivered: 'Livree',
   'active-rental': 'Location active',
   'return-scheduled': 'Retour programme',
   returned: 'Restituee',
   completed: 'Terminee',
   cancelled: 'Annulee',
};

const workflowSteps: Array<{ status: ReservationStatus; label: string }> = [
   { status: 'pending', label: 'Validation' },
   { status: 'confirmed', label: 'Confirmee' },
   { status: 'ready-for-delivery', label: 'Preparation' },
   { status: 'in-delivery', label: 'Livraison' },
   { status: 'delivered', label: 'Remise' },
   { status: 'active-rental', label: 'Location' },
   { status: 'return-scheduled', label: 'Retour prevu' },
   { status: 'returned', label: 'Restitution' },
   { status: 'completed', label: 'Cloturee' },
];

const getStepIndex = (status?: ReservationStatus) => workflowSteps.findIndex((step) => step.status === status);

const getProgressWidth = (status?: ReservationStatus) => {
   const currentIndex = getStepIndex(status);
   if (currentIndex <= 0) return '0%';
   const ratio = (currentIndex / (workflowSteps.length - 1)) * 100;
   return `${ratio}%`;
};

const vehicleStateLabel = (value?: string) => {
   if (value === 'available') return 'Disponible';
   if (value === 'rented') return 'Loue';
   if (value === 'maintenance') return 'Maintenance';
   if (value === 'unavailable') return 'Indisponible';
   return 'Non defini';
};

const vehicleStateClass = (value?: string) => {
   if (value === 'available') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
   if (value === 'rented') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
   if (value === 'maintenance') return 'bg-amber-50 text-amber-700 border-amber-200';
   if (value === 'unavailable') return 'bg-rose-50 text-rose-700 border-rose-200';
   return 'bg-slate-100 text-slate-700 border-slate-200';
};

const statusBadgeClass = (status?: string) => {
   if (status === 'rejected' || status === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200';
   if (status === 'returned' || status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
   if (status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
   return 'bg-sky-50 text-sky-700 border-sky-200';
};

const formatDateOrFallback = (value: unknown, fallback = 'Date indisponible') => {
   const date = new Date(String(value || ''));
   return Number.isNaN(date.getTime()) ? fallback : date.toLocaleDateString();
};

const formatDateTimeOrFallback = (value: unknown, fallback = 'N/A') => {
   const date = new Date(String(value || ''));
   return Number.isNaN(date.getTime()) ? fallback : date.toLocaleTimeString();
};

const formatTextOrFallback = (value: unknown, fallback = 'Non renseigne') => {
   if (typeof value === 'string' && value.trim().length > 0) return value;
   return fallback;
};

const formatAmount = (value: unknown) => {
   const amount = Number(value);
   return Number.isFinite(amount) ? amount.toLocaleString() : '0';
};

const getRentalDays = (reservation: ReservationDetails | null) => {
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

const getBasePrice = (reservation: ReservationDetails | null, rentalDays: number) => {
   const daily = Number(reservation?.pricingBreakdown?.daily ?? reservation?.carId?.dailyPrice ?? 0);
   const explicitBase = Number(reservation?.pricingBreakdown?.basePrice);
   if (Number.isFinite(explicitBase)) return explicitBase;
   return daily * rentalDays;
};

const getExtrasTotal = (reservation: ReservationDetails | null) => {
   const explicitTotal = Number(reservation?.pricingBreakdown?.extrasTotal);
   if (Number.isFinite(explicitTotal)) return explicitTotal;

   const extras = reservation?.pricingBreakdown?.extras;
   if (Array.isArray(extras)) {
      return extras.reduce((sum: number, value: unknown) => sum + (Number(value) || 0), 0);
   }

   return 0;
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
   const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
   const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
   const [confirmationSuccess, setConfirmationSuccess] = useState(false);

   const fetchReservation = useCallback(async (showInitialLoader = false) => {
      if (showInitialLoader) setFetching(true);

      const token = localStorage.getItem('carlaville_token');
      try {
         const res = await fetch(`${API_BASE_URL}/client/reservations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
         });

         if (!res.ok) throw new Error(await resolveReservationError(res));
         const data = await res.json();
         setReservation(data);
         setLastSyncedAt(new Date());
         setError('');
      } catch (err) {
         const message = err instanceof Error ? err.message : 'Erreur de chargement de la reservation.';
         setError(message);
      } finally {
         if (showInitialLoader) setFetching(false);
      }
   }, [id]);

   useEffect(() => {
      fetchReservation(true);
   }, [fetchReservation]);

   useEffect(() => {
      const intervalId = window.setInterval(() => {
         fetchReservation(false);
      }, 15000);

      const onVisible = () => {
         if (document.visibilityState === 'visible') {
            fetchReservation(false);
         }
      };

      document.addEventListener('visibilitychange', onVisible);
      return () => {
         window.clearInterval(intervalId);
         document.removeEventListener('visibilitychange', onVisible);
      };
   }, [fetchReservation]);

   const rentalDays = getRentalDays(reservation);
   const basePrice = getBasePrice(reservation, rentalDays);
   const extrasTotal = getExtrasTotal(reservation);
   const totalPrice = Number.isFinite(Number(reservation?.pricingBreakdown?.total))
      ? Number(reservation?.pricingBreakdown?.total)
      : basePrice + extrasTotal;

   const normalizedStatus = reservation?.status || 'pending';
   const statusLabel = statusLabels[normalizedStatus] || normalizedStatus;
   const currentStepIndex = getStepIndex(normalizedStatus);

   const canConfirmReservation = useMemo(() => {
      if (!reservation) return false;
      return reservation.status === 'pending' || reservation.paymentStatus === 'unpaid';
   }, [reservation]);

  const handleConfirmReservation = async () => {
    setLoading(true);
      setError('');
      setConfirmationSuccess(false);
    try {
         const token = localStorage.getItem('carlaville_token');
         const res = await fetch(`${API_BASE_URL}/payments/confirm-pickup/${id}`, {
        method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
      });
      
      if (!res.ok) throw new Error('Une erreur est survenue lors de la confirmation.');
      
         setConfirmationSuccess(true);
         await fetchReservation(false);
      } catch (err) {
         const message = err instanceof Error ? err.message : 'Une erreur est survenue lors de la confirmation.';
         setError(message);
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

   if (!reservation) {
      return (
         <div className="min-h-screen bg-white pt-28 pb-20 mt-12">
            <div className="container mx-auto px-4 max-w-3xl">
               <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-8 text-center">
                  <p className="text-sm font-black uppercase tracking-wider text-rose-700">Réservation inaccessible</p>
                  <p className="mt-3 text-sm font-medium text-rose-600">{error || 'Cette réservation est introuvable ou vous n\'avez pas les droits.'}</p>
                  <Link href="/dashboard" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800">
                     Retour au tableau de bord
                  </Link>
               </div>
            </div>
         </div>
      );
   }

  return (
    <div className="min-h-screen bg-white pt-28 pb-20 mt-12">
      <div className="container mx-auto px-4 max-w-6xl">
            <Link href="/dashboard/reservations" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary mb-8 transition-colors">
           <ArrowLeft className="w-4 h-4" /> Retour au compte
        </Link>

            <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
               <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusBadgeClass(normalizedStatus)}`}>
                     {statusLabel}
                  </span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                     Ref: {reservation.bookingReference || 'N/A'}
                  </span>
               </div>

               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <RefreshCw className="w-3.5 h-3.5" />
                  MAJ auto toutes les 15s
                  <span className="text-gray-300">|</span>
                  {lastSyncedAt ? formatDateTimeOrFallback(lastSyncedAt.toISOString(), 'N/A') : 'N/A'}
               </div>
            </div>

            <div className="mb-12 rounded-[2rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                  <Timer className="w-4 h-4 text-red-600" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Suivi du cycle reservation</p>
               </div>

               <div className="relative flex justify-between gap-2">
                  <div className="absolute top-4 left-0 h-[2px] w-full bg-gray-100"></div>
                  <div className="absolute top-4 left-0 h-[2px] bg-red-600 transition-all duration-700" style={{ width: getProgressWidth(normalizedStatus) }}></div>
                  {workflowSteps.map((step, index) => (
                     <WorkflowStepNode
                        key={step.status}
                        label={step.label}
                        active={currentStepIndex >= index && currentStepIndex !== -1}
                     />
                  ))}
               </div>
            </div>

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
                      {reservation?.carId?.images?.[0] || reservation?.carId?.imageUrl ? (
                        <img 
                          src={reservation?.carId?.images?.[0] || reservation?.carId?.imageUrl} 
                          alt={formatTextOrFallback(reservation?.carId?.brand, 'Vehicule')} 
                          className="w-full h-auto object-contain transform group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-44 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
                          <CarIcon className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4 flex-1">
                                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                     {formatTextOrFallback(reservation?.carId?.brand)} {formatTextOrFallback(reservation?.carId?.model, 'N/A')}
                                  </h2>
                       <div className="grid grid-cols-2 gap-4">
                          <CarFeature icon={<Settings className="w-3.5 h-3.5" />} text={formatTextOrFallback(reservation?.carId?.transmission)} />
                          <CarFeature icon={<Fuel className="w-3.5 h-3.5" />} text={formatTextOrFallback(reservation?.carId?.fuelType)} />
                          <CarFeature icon={<Users className="w-3.5 h-3.5" />} text={`${reservation?.carId?.seats || 'N/A'} Places`} />
                          <CarFeature icon={<CarIcon className="w-3.5 h-3.5" />} text={formatTextOrFallback(reservation?.carId?.category)} />
                       </div>
                       <div className="flex items-center gap-3 pt-3">
                         <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Etat vehicule</span>
                         <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${vehicleStateClass(reservation?.carId?.availabilityStatus)}`}>
                            {vehicleStateLabel(reservation?.carId?.availabilityStatus)}
                         </span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <SummaryItem label="Prise en charge" value={formatTextOrFallback(reservation?.pickupLocation)} date={formatDateOrFallback(reservation?.pickupDate)} time={formatTextOrFallback(reservation?.pickupTime)} />
                 <SummaryItem label="Restitution" value={formatTextOrFallback(reservation?.returnLocation)} date={formatDateOrFallback(reservation?.returnDate)} time={formatTextOrFallback(reservation?.returnTime)} />
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
                    {reservation?.selectedExtras && reservation.selectedExtras.length > 0 && (
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Extras & Services</p>
                          {reservation.selectedExtras.map((extra, idx) => (
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

                         {confirmationSuccess && (
                              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                                  <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-2 uppercase tracking-wide">
                                       <CheckCircle2 className="w-3.5 h-3.5" /> Reservation confirmee avec succes
                                  </p>
                              </div>
                         )}

                         {(reservation?.carId?.availabilityStatus === 'maintenance' || reservation?.carId?.availabilityStatus === 'unavailable') && (
                            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                               <p className="text-xs font-bold text-amber-700 flex items-center gap-2 uppercase tracking-wide">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Vehicule temporairement non operationnel
                               </p>
                               <p className="mt-2 text-xs font-medium text-amber-700/90">
                                  Le service client vous notifiera automatiquement lors de la reprise du workflow.
                               </p>
                            </div>
                         )}

                         {canConfirmReservation ? (
                            <button 
                               onClick={handleConfirmReservation}
                               disabled={loading}
                               className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-hover shadow-xl shadow-red-200 transition-all active:scale-95 disabled:opacity-70 group flex items-center justify-center"
                            >
                                 {loading ? (
                                     <Loader2 className="w-6 h-6 animate-spin" />
                                 ) : (
                                     <>Confirmer ma Reservation <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" /></>
                                 )}
                            </button>
                         ) : (
                            <div className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-center">
                               <p className="text-xs font-black uppercase tracking-wider text-gray-500">
                                  Reservation deja en cours de traitement
                               </p>
                            </div>
                         )}

                 <div className="mt-8 flex flex-col gap-4">
                    <Benefit icon={<Handshake className="w-4 h-4" />} text="Paiement à la prise en charge" />
                              <Benefit icon={<ShieldCheck className="w-4 h-4" />} text="Mise a jour automatique du statut" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

const CarFeature = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <div className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-tight">
     <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">{icon}</div>
     {text}
  </div>
);

const SummaryItem = ({
   label,
   value,
   date,
   time,
}: {
   label: string;
   value: string;
   date: string;
   time: string;
}) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm border-b-4 border-b-primary/10">
     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{label}</p>
     <h4 className="text-lg font-black text-gray-900 mb-2 leading-none">{value}</h4>
     <div className="flex items-center gap-4 text-xs font-bold text-gray-400 italic">
        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {date}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {time}</span>
     </div>
  </div>
);

const PriceRow = ({ label, value, isExtra = false }: { label: string; value: number; isExtra?: boolean }) => (
  <div className={`flex justify-between items-center text-sm font-black ${isExtra ? 'text-gray-400 py-1' : 'text-gray-900'}`}>
     <span className={isExtra ? "ml-4" : ""}>{label}</span>
     <span>{value?.toLocaleString()} MAD</span>
  </div>
);

const Benefit = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center justify-center">
     <div className="text-primary">{icon}</div>
     {text}
  </div>
);

const WorkflowStepNode = ({ label, active }: { label: string; active: boolean }) => (
   <div className="relative z-10 flex flex-col items-center gap-2">
       <div
          className={`w-8 h-8 rounded-full border-4 bg-white flex items-center justify-center transition-all duration-500 ${
             active ? 'border-red-600 text-red-600' : 'border-gray-200 text-gray-300'
          }`}
       >
          {active ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5" />}
       </div>
       <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-gray-900' : 'text-gray-300'}`}>
          {label}
       </span>
  </div>
);

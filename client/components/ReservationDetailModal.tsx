"use client";
import {
   X,
   Car,
   MapPin,
   Calendar,
   Clock,
   CheckCircle2,
   Info,
   Navigation,
   Fuel,
   Settings,
   Users,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, type ReactNode } from 'react';

interface ReservationDetailModalProps {
   reservation: ReservationDetails | null;
   isOpen: boolean;
   onClose: () => void;
}

interface ReservationCar {
   brand?: string;
   model?: string;
   year?: number;
   transmission?: string;
   fuelType?: string;
   seats?: number;
   city?: string;
   imageUrl?: string;
   images?: string[];
   availabilityStatus?: 'available' | 'rented' | 'maintenance' | 'unavailable' | string;
}

interface ReservationDetails {
   status: string;
   bookingReference?: string;
   carId?: ReservationCar;
   pickupLocation?: string;
   returnLocation?: string;
   pickupDate?: string;
   returnDate?: string;
   pickupTime?: string;
   returnTime?: string;
   rentalDays?: number;
   pricingBreakdown?: {
      total?: number;
      daily?: number;
   };
}

const statusLabels: Record<string, string> = {
   pending: 'En attente',
   confirmed: 'Confirmée',
   rejected: 'Rejetée',
   'ready-for-delivery': 'Prête livraison',
   'in-delivery': 'En livraison',
   delivered: 'Livrée',
   'active-rental': 'Location active',
   'return-scheduled': 'Retour programmé',
   returned: 'Restituée',
   completed: 'Terminée',
   cancelled: 'Annulée',
};

const workflowSteps: Array<{ status: string; label: string }> = [
   { status: 'pending', label: 'Validation' },
   { status: 'confirmed', label: 'Confirmée' },
   { status: 'ready-for-delivery', label: 'Préparation' },
   { status: 'in-delivery', label: 'Livraison' },
   { status: 'delivered', label: 'Remise' },
   { status: 'active-rental', label: 'Location' },
   { status: 'return-scheduled', label: 'Retour prévu' },
   { status: 'returned', label: 'Restitution' },
   { status: 'completed', label: 'Clôturée' },
];

const statusBadgeClass = (status: string) => {
   if (['rejected', 'cancelled'].includes(status)) return 'bg-rose-50 text-rose-700 border-rose-200';
   if (['completed', 'returned'].includes(status)) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
   if (['in-delivery', 'ready-for-delivery', 'delivered', 'active-rental', 'return-scheduled', 'confirmed'].includes(status)) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
   }
   return 'bg-amber-50 text-amber-700 border-amber-200';
};

const getStepProgress = (status: string) => {
   const currentIndex = workflowSteps.findIndex((step) => step.status === status);
   if (currentIndex <= 0) return '0%';
   const ratio = (currentIndex / (workflowSteps.length - 1)) * 100;
   return `${ratio}%`;
};

const formatDate = (value?: string) => {
   if (!value) return 'Date indisponible';
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? 'Date invalide' : date.toLocaleDateString();
};

const vehicleStateLabel = (value?: string) => {
   if (value === 'available') return 'Disponible';
   if (value === 'rented') return 'Loué';
   if (value === 'maintenance') return 'Maintenance';
   if (value === 'unavailable') return 'Indisponible';
   return 'Non défini';
};

const vehicleStateClass = (value?: string) => {
   if (value === 'available') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
   if (value === 'rented') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
   if (value === 'maintenance') return 'bg-amber-50 text-amber-700 border-amber-200';
   return 'bg-slate-100 text-slate-700 border-slate-200';
};

export default function ReservationDetailModal({ reservation, isOpen, onClose }: ReservationDetailModalProps) {
   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [isOpen]);

   if (!isOpen || !reservation) return null;
   if (typeof document === 'undefined') return null;

   const car = reservation.carId || {};
   const carImage = car.images?.[0] || car.imageUrl || "";
   const normalizedStatus = reservation.status || 'pending';
   const stepIndex = workflowSteps.findIndex((step) => step.status === normalizedStatus);

   const modalContent = (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>

         <div className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-[2.5rem] shadow-[0_0_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col translate-y-0">
            {/* Top Branding Bar */}
            <div className="bg-neutral-900 px-8 py-4 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                     <Car className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Détails de la Réservation</span>
               </div>
               <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                  <X size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12">
               <div className="space-y-12">

                  {/* Car Section */}
                  <div className="flex flex-col lg:flex-row gap-10 items-center">
                     <div className="w-full lg:w-1/2 aspect-video bg-gray-50 rounded-[2rem] p-8 flex items-center justify-center border border-gray-100 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent"></div>
                        {carImage ? (
                           <img
                              src={carImage}
                              className="relative z-10 max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-700"
                              alt={car.brand}
                           />
                        ) : (
                           <div className="flex flex-col items-center gap-4 text-gray-200">
                              <Car size={80} strokeWidth={1} />
                              <span className="text-[10px] font-black uppercase text-gray-300">Image indisponible</span>
                           </div>
                        )}
                     </div>

                     <div className="w-full lg:w-1/2 space-y-6">
                        <div>
                           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-2 inline-block ${statusBadgeClass(normalizedStatus)}`}>
                              {statusLabels[normalizedStatus] || normalizedStatus}
                           </span>
                           <h2 className="text-4xl font-black text-neutral-900 tracking-tighter leading-tight italic">
                              {car.brand || 'Véhicule'} {car.model || 'N/A'}
                           </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <SpecItem icon={<Settings size={14} />} label="Trans." value={car.transmission || "N/A"} />
                           <SpecItem icon={<Fuel size={14} />} label="Fuel" value={car.fuelType || "N/A"} />
                           <SpecItem icon={<Users size={14} />} label="Seats" value={car.seats || "N/A"} />
                           <SpecItem icon={<Info size={14} />} label="Ref" value={reservation.bookingReference?.slice(-8).toUpperCase() || 'N/A'} />
                        </div>

                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">État véhicule</span>
                           <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${vehicleStateClass(car.availabilityStatus)}`}>
                              {vehicleStateLabel(car.availabilityStatus)}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Logistics & Journey */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                     <div className="space-y-6">
                        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2 italic">
                           <Navigation className="w-4 h-4 text-red-600" /> Suivi de Progression
                        </h3>
                        <div className="relative flex justify-between gap-2 py-4">
                           <div className="absolute top-9 left-0 w-full h-[2px] bg-gray-50"></div>
                           <div className="absolute top-9 left-0 h-[2px] bg-red-600 transition-all duration-1000 origin-left" style={{ width: getStepProgress(normalizedStatus) }}></div>

                           {workflowSteps.map((step, index) => (
                              <Step
                                 key={step.status}
                                 active={stepIndex >= index && stepIndex !== -1}
                                 label={step.label}
                              />
                           ))}
                        </div>
                        {car.availabilityStatus === 'maintenance' || car.availabilityStatus === 'unavailable' ? (
                           <p className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                              Le véhicule est actuellement {vehicleStateLabel(car.availabilityStatus).toLowerCase()}. Certaines étapes peuvent être temporairement bloquées.
                           </p>
                        ) : null}
                     </div>

                     <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-6">Récapitulatif Financier</h3>
                        <div className="space-y-4">
                           <PriceRow label="Durée" value={`${reservation.rentalDays} Jours`} />
                           <PriceRow label="Base / Jour" value={`${reservation.pricingBreakdown?.daily || 0} MAD`} />
                           <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                              <p className="text-[10px] font-black text-neutral-900 uppercase tracking-widest leading-none">Total à régler</p>
                              <p className="text-2xl font-black text-red-600 tracking-tighter leading-none">
                                 {(reservation.pricingBreakdown?.total || 0).toLocaleString()} <span className="text-xs">MAD</span>
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Location Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                     <LocationBox
                        label="Retrait"
                        value={reservation.pickupLocation}
                        date={formatDate(reservation.pickupDate)}
                        time={reservation.pickupTime}
                     />
                     <LocationBox
                        label="Restitution"
                        value={reservation.returnLocation}
                        date={formatDate(reservation.returnDate)}
                        time={reservation.returnTime}
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );

   return createPortal(modalContent, document.body);
}

const SpecItem = ({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) => (
   <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-neutral-400 shadow-sm">{icon}</div>
      <div>
         <p className="text-[8px] font-black text-gray-400 uppercase leading-none mb-1">{label}</p>
         <p className="text-[10px] font-black text-neutral-900 leading-none truncate">{value}</p>
      </div>
   </div>
);

const PriceRow = ({ label, value }: { label: string; value: string | number }) => (
   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wide">
      <span className="text-gray-400">{label}</span>
      <span className="text-neutral-900">{value}</span>
   </div>
);

const Step = ({ active, label }: { active: boolean, label: string }) => (
   <div className="relative z-10 flex flex-col items-center gap-2">
      <div className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all duration-700 ${active ? 'bg-red-600 border-white scale-110 shadow-lg shadow-red-100' : 'bg-white border-gray-100 shadow-sm'
         }`}>
         {active && <CheckCircle2 className="w-4 h-4 text-white" />}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-neutral-900' : 'text-gray-300'
         }`}>{label}</span>
   </div>
);

function LocationBox({ label, value, date, time }: { label: string; value?: string; date: string; time?: string }) {
   return (
      <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex items-start gap-4 hover:border-red-100 transition-colors">
         <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-red-600">
            <MapPin size={20} />
         </div>
         <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <h4 className="text-sm font-black text-neutral-900 mb-1">{value}</h4>
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 italic">
               <span className="flex items-center gap-1"><Calendar size={12} /> {date}</span>
               <span className="flex items-center gap-1"><Clock size={12} /> {time}</span>
            </div>
         </div>
      </div>
   );
}

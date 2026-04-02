import { Car, Agency, AvailabilityStatus } from '@/types';
import { 
  Trash2, 
  Fuel, 
  Zap, 
  MapPin, 
  Calendar, 
  Users,
  Briefcase,
  Wallet,
  Truck,
  CalendarDays,
  BadgeCheck, 
  ShieldCheck, 
  Info,
  Car as CarIcon,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface CarDetailsProps {
  car: Car;
  agencies: Agency[];
}

export const CarDetails = ({ car, agencies }: CarDetailsProps) => {
  const agency = useMemo(() => {
    const rawAgencyId = (car as any).agencyId;
    if (!rawAgencyId) return car.agency;
    const id = typeof rawAgencyId === 'string' ? rawAgencyId : (rawAgencyId.id || rawAgencyId._id);
    return agencies.find(a => (a.id || (a as any)._id) === id) || car.agency;
  }, [car, agencies]);

  const normalizeUrl = (url: string) => url ? url.replace('127.0.0.1', 'localhost') : '';

  return (
    <div className="flex flex-col gap-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-100">
                {car.brand}
             </span>
             {car.availabilityStatus === AvailabilityStatus.AVAILABLE ? (
               <span className="flex items-center gap-1.5 bg-green-50 text-green-600 text-[10px] font-black uppercase px-3 py-1 rounded-lg border border-green-100">
                  Disponible
               </span>
             ) : (
               <span className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-3 py-1 rounded-lg border border-blue-100">
                  {car.availabilityStatus === AvailabilityStatus.RENTED ? 'En Location' : car.availabilityStatus}
               </span>
             )}
          </div>
          <h2 className="text-4xl font-black text-slate-900 font-geist tracking-tight">{car.model} <span className="text-slate-300 ml-2">{car.year}</span></h2>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 flex items-center gap-4 min-width-[180px]">
           <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-500">
              <Zap size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tarif Journalier</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{car.dailyPrice} <span className="text-sm">DH</span></p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery & Description */}
        <div className="lg:col-span-12 space-y-10">
          {/* Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {car.images && car.images.length > 0 ? (
               car.images.map((url, idx) => (
                 <div key={idx} className={cn(
                   "group relative rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-all duration-500 hover:shadow-xl",
                   idx === 0 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-video" : "aspect-square"
                 )}>
                   <img 
                     src={normalizeUrl(url)} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                     alt={`Vue ${idx + 1}`} 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
               ))
             ) : (
               <div className="col-span-full h-64 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                  <CarIcon size={48} className="opacity-10 mb-2" />
                  <p className="text-xs font-bold uppercase">Aucune image disponible</p>
               </div>
             )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <Fuel size={18} className="text-red-500" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carburant</p>
                   <p className="text-[13px] font-black text-slate-900">{car.fuelType}</p>
                </div>
             </div>
             <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <Zap size={18} className="text-red-500" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transmission</p>
                   <p className="text-[13px] font-black text-slate-900">{car.transmission}</p>
                </div>
             </div>
             <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <Users size={18} className="text-red-500" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sièges</p>
                   <p className="text-[13px] font-black text-slate-900">{car.seats} Places</p>
                </div>
             </div>
             <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <Briefcase size={18} className="text-red-500" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bagages</p>
                   <p className="text-[13px] font-black text-slate-900">{car.luggage || 0} Sacs</p>
                </div>
             </div>
          </div>

          {/* New Specs Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <Wallet size={18} className="text-blue-500" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Caution</p>
                   <p className="text-[13px] font-black text-slate-900">{car.depositAmount || 0} DH</p>
                </div>
             </div>
             <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <Truck size={18} className="text-blue-500" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Frais Livraison</p>
                   <p className="text-[13px] font-black text-slate-900">{car.deliveryFee || 0} DH</p>
                </div>
             </div>
             <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <CalendarDays size={18} className="text-blue-500" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Min. Location</p>
                   <p className="text-[13px] font-black text-slate-900">{car.minRentalDays || 1} Jour(s)</p>
                </div>
             </div>
             <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col gap-2">
                <BadgeCheck size={18} className="text-green-500" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Catégorie</p>
                   <p className="text-[13px] font-black text-slate-900">{car.category}</p>
                </div>
             </div>
          </div>

          {/* Description & Agency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                   <Info size={14} className="text-red-500" /> Description du Véhicule
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                   {car.description || "Aucune description détaillée n'a été fournie pour ce véhicule. Ce modèle d'exception offre confort, sécurité et performance pour tous vos déplacements."}
                </p>
             </div>

             <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                   <MapPin size={14} className="text-red-500" /> Agence Responsable
                </h3>
                <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                   <div className="relative z-10">
                      <p className="text-xl font-black mb-1">{agency?.name || 'Agence Centrale'}</p>
                      <p className="text-slate-400 text-xs font-medium flex items-center gap-2">
                         <MapPin size={12} /> {agency?.address || 'Adresse en cours de chargement...'}
                      </p>
                      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact Agence</span>
                         <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                               <ChevronRight size={16} />
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import { Car, Agency, AvailabilityStatus } from '@/types';
import { 
  Settings, 
  Trash2, 
  Fuel, 
  Zap, 
  MapPin, 
  Eye, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  MoreVertical 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface CarCardProps {
  car: Car;
  agencies: Agency[];
  onEdit: (car: Car) => void;
  onDelete: (id: string) => void;
  onView: (car: Car) => void;
}

export const AdminCarCard = ({ car, agencies, onEdit, onDelete, onView }: CarCardProps) => {
  const carId = car.id || (car as any)._id || '';
  
  const agencyName = useMemo(() => {
    const rawAgencyId = (car as any).agencyId;
    if (!rawAgencyId) return car.agency?.name || 'N/A';
    const id = typeof rawAgencyId === 'string' ? rawAgencyId : (rawAgencyId.id || rawAgencyId._id);
    const agency = agencies.find(a => (a.id || (a as any)._id) === id);
    return agency?.name || car.agency?.name || 'Inconnue';
  }, [car, agencies]);

  const previewImage = useMemo(() => {
    const rawImg = car.images?.[0];
    if (!rawImg) return null;
    return rawImg.replace('127.0.0.1', 'localhost');
  }, [car.images]);

  return (
    <div className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      {/* Visual Header */}
      <div 
        className="relative aspect-[4/3] overflow-hidden bg-slate-50 cursor-pointer"
        onClick={() => onView(car)}
      >
        {previewImage ? (
          <img 
            src={previewImage} 
            alt={car.model} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
             <Zap size={48} className="opacity-20" />
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-4 left-4">
           {car.availabilityStatus === AvailabilityStatus.AVAILABLE ? (
             <span className="flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg shadow-green-500/20">
                <CheckCircle2 size={12} /> Disponible
             </span>
           ) : car.availabilityStatus === AvailabilityStatus.RENTED ? (
             <span className="flex items-center gap-1.5 bg-blue-500 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-lg shadow-blue-500/20">
                <Eye size={12} /> En Location
             </span>
           ) : (
             <span className="flex items-center gap-1.5 bg-slate-400 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl">
                <AlertCircle size={12} /> {car.availabilityStatus}
             </span>
           )}
        </div>

        {/* Agency Tag */}
        <div className="absolute bottom-4 left-4 glass px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/20 shadow-sm backdrop-blur-md bg-white/60">
           <MapPin size={10} className="text-red-500" />
           <span className="text-[10px] font-bold text-slate-800">{agencyName}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{car.brand}</p>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1 font-geist">{car.model}</h3>
           </div>
           <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{car.year}</span>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-50">
           <div className="flex items-center gap-2 text-slate-500">
              <Fuel size={14} className="text-slate-300" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{car.fuelType}</span>
           </div>
           <div className="flex items-center gap-2 text-slate-500">
              <Zap size={14} className="text-slate-300" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{car.transmission}</span>
           </div>
        </div>

        <div className="flex items-center justify-between pt-2">
           <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block leading-none">Tarif/Jour</span>
              <span className="text-lg font-black text-slate-900">{car.dailyPrice} DH</span>
           </div>

           <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onView(car)}
                className="w-10 h-10 rounded-xl p-0 hover:bg-red-50 hover:text-red-600 transition-all border-slate-100"
              >
                 <Eye size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(car)}
                className="w-10 h-10 rounded-xl p-0 hover:bg-slate-900 hover:text-white transition-all border-slate-100"
              >
                 <Settings size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(carId)}
                className="w-10 h-10 rounded-xl p-0 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm shadow-rose-100"
              >
                 <Trash2 size={16} />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

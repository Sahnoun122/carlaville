import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useMemo } from 'react';
import { Users, Fuel, Settings, MapPin, ArrowUpRight } from 'lucide-react';

interface VehicleCardProps {
  car: {
    id?: string;
    _id?: string;
    brand: string;
    model: string;
    dailyPrice: number;
    category: string;
    transmission: string;
    fuelType: string;
    seats: number;
    city: string;
    imageUrl?: string;
    images?: string[];
  };
}

const resolveCarId = (car: VehicleCardProps['car']) => car.id || car._id || '';

export default function VehicleCard({ car }: VehicleCardProps) {
  const carId = resolveCarId(car);
  const images = car.images || [];
  const rawImage = images.length > 0 ? images[0] : car.imageUrl;
  
  // Normalize URL to handle local vs production image paths
  const previewImage = useMemo(() => {
    if (typeof rawImage !== 'string' || rawImage.trim().length === 0) return null;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://carlaville-ykc8.vercel.app';
    const backendHost = new URL(API_URL).host;
    
    // If the image URL points to a local address, replace it with the current backend host
    return rawImage.replace('127.0.0.1:3009', backendHost).replace('localhost:3009', backendHost);
  }, [rawImage]);

  return (
    <div className="group bg-white rounded-[2.5rem] border border-gray-100 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2">
      {/* Image Area */}
      <div className="relative h-56 md:h-64 w-full bg-[#fcfcfc] rounded-[2rem] overflow-hidden flex items-center justify-center p-8">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-2xl -ml-12 -mb-12"></div>
        
        <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur-md border border-gray-100 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-black shadow-sm z-10">
          {car.category}
        </div>
        
        {previewImage ? (
          <Image 
            src={previewImage} 
            alt={`${car.brand} ${car.model}`} 
            fill
            className="object-contain p-6 md:p-10 transition-all duration-700 group-hover:scale-110 drop-shadow-2xl" 
            unoptimized={true}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-10 w-full h-full text-gray-200">
            <div className="w-16 h-16 mb-4 border-2 border-dashed border-gray-100 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 opacity-20 rotate-45" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{car.brand}</span>
            <span className="text-[8px] font-bold text-gray-200/50 uppercase tracking-[0.4em] mt-1">Photo non disponible</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8 pt-6">
        <div className="flex justify-between items-start gap-4 mb-8">
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">{car.brand}</span>
             </div>
            <h3 className="text-xl md:text-2xl font-bold text-black tracking-tight truncate">
              {car.model}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-gray-400">
               <MapPin className="w-3 h-3 text-black/20" />
               <span className="text-[10px] font-bold uppercase tracking-widest">{car.city}</span>
            </div>
          </div>
          
          <div className="text-right">
             <div className="flex items-baseline gap-1 justify-end">
                <span className="text-2xl font-black text-black">{car.dailyPrice}</span>
                <span className="text-[10px] font-black text-black/30 uppercase">MAD</span>
             </div>
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">/ jour</p>
          </div>
        </div>
        
        {/* Refined Feature Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
           <SimpleFeature icon={<Users className="w-4 h-4" />} label={`${car.seats} ${car.seats > 1 ? 'Places' : 'Place'}`} />
           <SimpleFeature icon={<Settings className="w-4 h-4" />} label={car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manuelle'} />
           <SimpleFeature icon={<Fuel className="w-4 h-4" />} label={car.fuelType} />
        </div>
        
        <div className="relative group/btn">
          <Link 
            href={carId ? `/cars/${carId}` : '/cars'} 
            className="w-full h-14 bg-black text-white flex items-center justify-center gap-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:bg-neutral-800 shadow-xl shadow-black/5 active:scale-[0.98] overflow-hidden"
          >
            <span>Réserver maintenant</span>
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

const SimpleFeature = ({ icon, label }: any) => (
  <div className="flex flex-col items-center justify-center gap-2 py-4 bg-gray-50/50 rounded-2xl border border-transparent group-hover:border-gray-100 group-hover:bg-white transition-all duration-300">
     <div className="text-black/20 group-hover:text-primary transition-colors">{icon}</div>
     <span className="text-[9px] font-black text-black/60 uppercase tracking-tighter text-center px-1">{label}</span>
  </div>
);


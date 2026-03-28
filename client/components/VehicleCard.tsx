import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Users, Fuel, Settings, MapPin } from 'lucide-react';

interface VehicleCardProps {
  car: {
    _id: string;
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

export default function VehicleCard({ car }: VehicleCardProps) {
  const rawImage = car.images?.[0] || car.imageUrl;
  const previewImage = (typeof rawImage === 'string' && rawImage.trim().length > 0) ? rawImage : null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 soft-shadow overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 md:h-56 w-full bg-white flex items-center justify-center p-6 md:p-8 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="absolute top-4 left-4 px-3 py-1 bg-white border border-gray-100 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-primary shadow-sm z-10">
          {car.category}
        </div>
        
        {previewImage && (previewImage.startsWith('/') || previewImage.startsWith('http')) ? (
          <Image 
            src={previewImage} 
            alt={`${car.brand} ${car.model}`} 
            fill
            className="object-contain p-4 md:p-6 transition-transform duration-700 group-hover:scale-110" 
            unoptimized={previewImage.startsWith('http') && !previewImage.includes('localhost')}
          />
        ) : (
          <div className="text-gray-200 font-black text-[10px] uppercase tracking-[0.3em] text-center border-2 border-dashed border-gray-50 rounded-2xl p-8 w-full h-full flex items-center justify-center">
            {car.brand}<br/>No Image
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex-1 flex flex-col pt-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter">
              {car.brand} <span className="text-primary/40 font-medium">/</span> {car.model}
            </h3>
            <p className="text-[10px] font-bold text-gray-400 mt-1.5 flex items-center gap-1.5 uppercase tracking-widest">
              <MapPin className="w-3 h-3 text-primary" /> {car.city}
            </p>
          </div>
          <div className="text-right">
             <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900">{car.dailyPrice}</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">MAD</span>
             </div>
             <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">par jour</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-8">
           <SimpleFeature icon={<Users className="w-3 h-3" />} label={`${car.seats}`} />
           <SimpleFeature icon={<Settings className="w-3 h-3" />} label={car.transmission[0]} />
           <SimpleFeature icon={<Fuel className="w-3 h-3" />} label={car.fuelType[0]} />
        </div>
        
        <div className="mt-auto">
          <Link 
            href={`/cars/${car._id}`} 
            className="w-full py-4 bg-gray-900 text-white text-center rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-gray-200 active:scale-95 block"
          >
            Réserver ce véhicule
          </Link>
        </div>
      </div>
    </div>
  );
}

const SimpleFeature = ({ icon, label }: any) => (
  <div className="flex flex-col items-center justify-center gap-1.5 py-3 bg-gray-50/50 rounded-2xl border border-gray-100/50 group-hover:bg-white transition-colors">
     <div className="text-gray-300">{icon}</div>
     <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{label}</span>
  </div>
);


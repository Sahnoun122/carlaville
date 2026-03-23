import Link from 'next/link';
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
  const previewImage = car.images?.[0] || car.imageUrl;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 soft-shadow overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full bg-gray-50 flex items-center justify-center p-6 border-b border-gray-50">
        <div className="absolute top-3 left-3 px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm z-10">
          {car.category}
        </div>
        
        {previewImage ? (
          <img 
            src={previewImage} 
            alt={`${car.brand} ${car.model}`} 
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="text-gray-300 font-bold text-xs uppercase tracking-widest text-center">
            {car.brand}<br/>Image indisponible
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {car.brand} {car.model}
            </h3>
            <p className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {car.city}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-gray-900 block">{car.dailyPrice} MAD</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">/ jour</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
           <SimpleFeature icon={<Users className="w-4 h-4" />} label={`${car.seats} Places`} />
           <SimpleFeature icon={<Settings className="w-4 h-4" />} label={car.transmission} />
           <SimpleFeature icon={<Fuel className="w-4 h-4" />} label={car.fuelType} />
           <SimpleFeature icon={<MapPin className="w-4 h-4" />} label="Secteur" />
        </div>
        
        <div className="mt-auto">
          <Link 
            href={`/cars/${car._id}`} 
            className="btn-premium w-full text-center block text-sm"
          >
            Réserver maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}

const SimpleFeature = ({ icon, label }: any) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
     <div className="text-gray-400">{icon}</div>
     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{label}</span>
  </div>
);

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center p-4">
        {previewImage ? (
          <img src={previewImage} alt={`${car.brand} ${car.model}`} className="h-full w-full object-contain" />
        ) : (
          <div className="text-gray-400 font-semibold text-center">{car.brand} {car.model}<br/><span className="text-xs font-normal">Image indéponible</span></div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{car.category}</span>
            <h3 className="text-xl font-bold text-gray-900">{car.brand} {car.model}</h3>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-primary">{car.dailyPrice} MAD</span>
            <span className="text-sm text-gray-500 block">/ jour</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 my-4 text-sm text-gray-600">
          <div className="flex items-center gap-1"><Users className="w-4 h-4 text-gray-400" /> {car.seats} Places</div>
          <div className="flex items-center gap-1"><Settings className="w-4 h-4 text-gray-400" /> {car.transmission}</div>
          <div className="flex items-center gap-1"><Fuel className="w-4 h-4 text-gray-400" /> {car.fuelType}</div>
          <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" /> {car.city}</div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link href={`/cars/${car._id}`} className="block w-full text-center bg-primary text-white py-2 rounded-md font-semibold hover:bg-red-700 transition-colors">
            Réserver
          </Link>
        </div>
      </div>
    </div>
  );
}

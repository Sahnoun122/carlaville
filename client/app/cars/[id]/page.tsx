import Image from 'next/image';
import { Users, Fuel, Settings, MapPin, Check } from 'lucide-react';
import ReservationForm from './ReservationForm';

async function getCar(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/cars/${id}`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[50vh] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Véhicule introuvable</h1>
        <p className="text-gray-500 mb-8">Nous n'avons pas pu trouver les informations pour ce véhicule.</p>
        <a href="/" className="bg-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-red-700">Retour à l'accueil</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-10">
            <div className="relative h-[300px] md:h-[450px] w-full bg-gray-50 rounded-2xl flex items-center justify-center p-8 mb-8 border border-gray-100">
              {car.imageUrl ? (
                <Image src={car.imageUrl} alt={`${car.brand} ${car.model}`} fill className="object-contain" />
              ) : (
                <div className="text-gray-400 font-semibold text-xl">{car.brand} {car.model}</div>
              )}
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-primary mt-2 uppercase text-sm font-bold tracking-wider mb-1">{car.category}</p>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{car.brand} {car.model}</h1>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">{car.dailyPrice} MAD</span>
                <span className="text-gray-500 block">/ jour</span>
              </div>
            </div>
              
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-red-50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-red-100">
                <Users className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm font-semibold text-gray-900">{car.seats} Places</span>
              </div>
              <div className="bg-red-50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-red-100">
                <Settings className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm font-semibold text-gray-900">{car.transmission}</span>
              </div>
              <div className="bg-red-50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-red-100">
                <Fuel className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm font-semibold text-gray-900">{car.fuelType}</span>
              </div>
              <div className="bg-red-50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-red-100">
                <MapPin className="w-6 h-6 text-primary mb-2" />
                <span className="text-sm font-semibold text-gray-900">{car.city}</span>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Équipements inclus</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg"><Check className="w-5 h-5 text-green-500 shrink-0" /> Climatisation</li>
                <li className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg"><Check className="w-5 h-5 text-green-500 shrink-0" /> Kilométrage illimité</li>
                <li className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg"><Check className="w-5 h-5 text-green-500 shrink-0" /> Assurance de base</li>
                <li className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg"><Check className="w-5 h-5 text-green-500 shrink-0" /> Assistance 24/7</li>
              </ul>
            </div>
          </div>
          
          <div className="w-full lg:w-1/3">
            <ReservationForm car={car} />
          </div>
        </div>
      </div>
    </div>
  );
}

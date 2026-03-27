import { Users, Fuel, Settings, MapPin, Check, ChevronLeft, ShieldCheck } from 'lucide-react';
import ReservationForm from './ReservationForm';
import Link from 'next/link';

async function getCar(id: string) {
  try {
    const res = await fetch(`http://localhost:3009/api/cars/${id}`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);
  const previewImage = car?.images?.[0] || car?.imageUrl;

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Véhicule introuvable</h1>
        <Link href="/cars" className="text-primary font-bold hover:underline">← Retour au catalogue</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Simple Navigation */}
        <div className="mb-8">
           <Link href="/cars" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" /> Retour au catalogue
           </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 soft-shadow">
               <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                  <div>
                     <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2 py-0.5 bg-red-50 rounded border border-red-100 mb-2 inline-block">
                        {car.category}
                     </span>
                     <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                        {car.brand} {car.model}
                     </h1>
                     <div className="flex items-center gap-2 text-gray-400 text-sm mt-1 font-medium">
                        <MapPin className="w-4 h-4" /> {car.city}
                     </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 text-right min-w-[140px]">
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tarif de base</p>
                     <p className="text-2xl font-black text-gray-900 tracking-tight">{car.dailyPrice} MAD <span className="text-xs font-normal text-gray-400">/ jour</span></p>
                  </div>
               </div>

               {/* Image Display */}
               <div className="h-[300px] md:h-[400px] w-full bg-white rounded-2xl flex items-center justify-center p-8 mb-8 border border-gray-100">
                  {previewImage ? (
                    <img src={previewImage} alt={`${car.brand} ${car.model}`} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-gray-200 font-bold text-xl uppercase tracking-widest">{car.brand} {car.model}</div>
                  )}
               </div>

               {/* Specs Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpecCard icon={<Users className="w-5 h-5" />} label="Places" value={`${car.seats} Places`} />
                  <SpecCard icon={<Settings className="w-5 h-5" />} label="Boîte" value={car.transmission} />
                  <SpecCard icon={<Fuel className="w-5 h-5" />} label="Énergie" value={car.fuelType} />
                  <SpecCard icon={<MapPin className="w-5 h-5" />} label="Région" value={car.city} />
               </div>
            </div>

            {/* Equipments */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 soft-shadow">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Équipements & Garanties</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <Inclusion text="Climatisation automatique" />
                  <Inclusion text="Kilométrage illimité" />
                  <Inclusion text="Assistance routière 24/7" />
                  <Inclusion text="Assurance tous risques" />
                  <Inclusion text="Plein de carburant" />
                  <Inclusion text="Nettoyage professionnel" />
               </div>
               
               <div className="mt-8 bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium flex gap-3 items-center border border-emerald-100">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  Véhicule désinfecté et certifié conforme pour chaque location.
               </div>
            </div>
          </div>
          
          {/* Reservation Card */}
          <div className="w-full lg:w-96 sticky top-28">
             <ReservationForm car={car} />
          </div>
        </div>
      </div>
    </div>
  );
}

const SpecCard = ({ icon, label, value }: any) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
     <div className="text-primary mb-2 opacity-80">{icon}</div>
     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
     <p className="text-sm font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

const Inclusion = ({ text }: any) => (
  <div className="flex items-center gap-3 text-gray-600 font-medium text-sm">
     <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 stroke-[3px]" />
     </div>
     {text}
  </div>
);

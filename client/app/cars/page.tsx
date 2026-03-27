import VehicleCard from '@/components/VehicleCard';
import CarsCatalog from '@/components/CarsCatalog';

async function getCars() {
  try {
    const res = await fetch('http://localhost:3009/api/cars', { next: { revalidate: 60 } });
    if (!res.ok) return { cars: [] };
    const data = await res.json();
    return data;
  } catch (error) {
    return { cars: [] };
  }
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locationParam = params.location;
  const initialSearch = Array.isArray(locationParam)
    ? locationParam[0] || ''
    : locationParam || '';

  const data = await getCars();
  const cars = data?.cars || [];

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-24">
      {/* Premium Header Section */}
      <div className="bg-gray-50 border-b border-gray-100 pt-32 pb-16 relative overflow-hidden">
        {/* Soft Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-red-50/20 rounded-full blur-[80px] -ml-16 -mb-16"></div>

        <div className="container mx-auto px-6 relative z-10 text-center lg:text-left">
           <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-4">
                 <span className="px-4 py-1.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-red-100">Catalogue 2026</span>
                 <h1 className="text-6xl lg:text-7xl font-black text-neutral-900 tracking-tighter leading-none">
                   Trouvez Votre <br className="hidden lg:block"/><span className="text-red-600">Prochaine Destination.</span>
                 </h1>
                 <p className="text-gray-400 font-medium text-lg max-w-2xl mx-auto lg:mx-0">Exploration sans limites avec notre sélection de véhicules premium, parfaitement entretenus pour votre confort.</p>
              </div>
              <div className="hidden lg:flex flex-col items-end text-right">
                 <div className="flex -space-x-4 mb-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-50"></div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-white bg-neutral-900 flex items-center justify-center text-[10px] font-black text-white">+50</div>
                 </div>
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-relaxed">Déjà plus de 2,400 <br/>réservations ce mois-ci</p>
              </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12">
        {cars && cars.length > 0 ? (
          <CarsCatalog initialCars={cars} initialSearch={initialSearch} />
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-50 max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-6">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Aucun véhicule disponible</p>
            <p className="text-gray-300 text-sm mt-2">Veuillez réessayer plus tard ou changer vos critères.</p>
          </div>
        )}
      </div>
    </div>
  );
}


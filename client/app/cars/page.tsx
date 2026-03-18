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
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Tous nos véhicules</h1>
        <div className="h-1.5 w-24 bg-primary rounded-full mb-6"></div>
        <p className="text-gray-500 mb-12 text-lg md:text-xl max-w-3xl">Découvrez notre gamme complète et choisissez le véhicule parfaitement adapté à vos besoins et à votre budget.</p>
        
        {cars && cars.length > 0 ? (
          <CarsCatalog initialCars={cars} initialSearch={initialSearch} />
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <p className="text-gray-500 text-xl font-medium">Aucun véhicule disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

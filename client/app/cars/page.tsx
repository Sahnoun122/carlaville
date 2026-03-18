import VehicleCard from '@/components/VehicleCard';

async function getCars() {
  try {
    const res = await fetch('http://localhost:3000/cars', { next: { revalidate: 60 } });
    if (!res.ok) return { cars: [] };
    const data = await res.json();
    return data;
  } catch (error) {
    return { cars: [] };
  }
}

export default async function CarsPage() {
  const data = await getCars();
  const cars = data?.cars || [];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Tous nos véhicules</h1>
        <div className="h-1.5 w-24 bg-primary rounded-full mb-6"></div>
        <p className="text-gray-500 mb-12 text-lg md:text-xl max-w-3xl">Découvrez notre gamme complète et choisissez le véhicule parfaitement adapté à vos besoins et à votre budget.</p>
        
        {cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {cars.map((car: any) => (
              <VehicleCard key={car._id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <p className="text-gray-500 text-xl font-medium">Aucun véhicule trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
}

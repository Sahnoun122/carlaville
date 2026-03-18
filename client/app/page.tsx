import VehicleCard from '../components/VehicleCard';
import { Calendar, MapPin, Search } from 'lucide-react';

async function getCars() {
  try {
    const res = await fetch('http://localhost:3000/cars?limit=6', { next: { revalidate: 60 } });
    if (!res.ok) return { cars: [] };
    const data = await res.json();
    return data;
  } catch (error) {
    return { cars: [] };
  }
}

export default async function Home() {
  const data = await getCars();
  const cars = data?.cars || [];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] bg-red-900 flex flex-col justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-red-800 to-red-950 opacity-100 z-0 text-white overflow-hidden">
           {/* Abstract shapes for premium feel */}
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 w-full max-w-5xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight shadow-sm drop-shadow-lg">
            La location de voiture, <br className="hidden md:block"/>
            <span className="text-white">simplement.</span>
          </h1>
          <p className="text-xl md:text-2xl text-red-100 mb-12 font-medium max-w-2xl mx-auto drop-shadow-md">
            Louez le véhicule parfait pour votre prochain voyage avec Carlaville.
          </p>

          {/* Search/Booking Widget */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 mb-[-120px] max-w-5xl mx-auto text-left transform translate-y-12 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary"/> Lieu de départ</label>
                <input type="text" placeholder="Casablanca, Rabat..." className="p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/> Date de départ</label>
                <input type="date" className="p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/> Date de retour</label>
                <input type="date" className="p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black transition-all" />
              </div>
              <div className="flex flex-col">
                <button className="w-full bg-primary text-white p-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  <Search className="w-5 h-5"/>
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* spacer for the overlapping widget */}
      <div className="h-48 md:h-32 bg-gray-50"></div>

      {/* Popular Vehicles Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Nos Véhicules Populaires</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
            <p className="mt-6 text-gray-500 text-lg max-w-2xl mx-auto">
              Découvrez notre sélection de véhicules les plus loués. Un large choix pour répondre à tous vos besoins.
            </p>
          </div>

          {cars && cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car: any) => (
                <VehicleCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
              <CarPlaceholder />
            </div>
          )}

          <div className="text-center mt-16">
            <a href="/cars" className="inline-block border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary hover:text-white transition-colors duration-300">
              Voir tous les véhicules
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 rounded-3xl bg-red-50 hover:bg-red-100 transition-colors cursor-pointer border border-red-100 group">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                <span className="text-3xl font-extrabold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Réservez facilement</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Choisissez votre véhicule et vos dates en quelques clics grâce à notre interface intuitive.</p>
            </div>
            <div className="p-8 rounded-3xl bg-red-50 hover:bg-red-100 transition-colors cursor-pointer border border-red-100 group">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                <span className="text-3xl font-extrabold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Confirmation rapide</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Recevez votre confirmation instantanément par email avec tous les détails de votre location.</p>
            </div>
            <div className="p-8 rounded-3xl bg-red-50 hover:bg-red-100 transition-colors cursor-pointer border border-red-100 group">
              <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                <span className="text-3xl font-extrabold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Prenez la route</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Récupérez votre véhicule en agence ou faites-vous livrer pour démarrer votre voyage sans délai.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CarPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <p className="text-gray-500 text-lg">Aucun véhicule disponible pour le moment.</p>
      <p className="text-gray-400 text-sm mt-2">Assurez-vous que le serveur backend est en cours d'exécution sur le port 3000.</p>
    </div>
  )
}

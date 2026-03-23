import VehicleCard from '../components/VehicleCard';
import Link from 'next/link';
import { Star, Clock, Laptop, ShieldCheck, CreditCard, Compass, ChevronDown, Plane, Shield, Zap, Search, MapPin } from 'lucide-react';
import HomeSearchWidget from '../components/HomeSearchWidget';

async function getCars() {
  try {
    const res = await fetch('http://localhost:3009/api/cars?limit=6', { next: { revalidate: 60 } });
    if (!res.ok) return { cars: [] };
    const data = await res.json();
    return data;
  } catch (error) {
    return { cars: [] };
  }
}

async function getBlogs() {
  try {
    const res = await fetch('http://localhost:3009/api/blogs?limit=3', {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { blogs: [] };
    const data = await res.json();
    return data;
  } catch {
    return { blogs: [] };
  }
}

export default async function Home() {
  const data = await getCars();
  const cars = data?.cars || [];
  const blogsData = await getBlogs();
  const blogs = blogsData?.blogs || [];

  return (
    <div className="w-full bg-white">
      
      {/* 🚀 Simple Hero Section */}
      <section className="relative pt-32 pb-20 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 text-center">
           <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
             Location de voiture <span className="text-primary text-primary">simple et rapide.</span>
           </h1>
           <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
             Réservez votre véhicule en quelques clics parmi notre large sélection de voitures récentes au Maroc.
           </p>

           <div className="max-w-5xl mx-auto">
             <HomeSearchWidget />
           </div>
        </div>
      </section>

      {/* 🚗 Vehicles Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
               <h2 className="text-3xl font-bold text-gray-900">Véhicules populaires</h2>
               <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">Nos meilleures offres</p>
            </div>
            <Link href="/cars" className="text-primary font-bold hover:underline flex items-center gap-2">
               Voir tout le catalogue →
            </Link>
          </div>

          {cars && cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car: any) => (
                <VehicleCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 max-w-2xl mx-auto">
               <p className="text-gray-400 font-medium">Aucun véhicule disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ✨ Why Carlaville - Simple Feature Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi nous choisir ?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Une expérience de location transparente et professionnelle.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SimpleFeature 
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Assurance Incluse"
              desc="Roulez en toute sérénité avec nos couvertures complètes et assistance 24/7."
            />
            <SimpleFeature 
              icon={<Clock className="w-6 h-6 text-primary" />}
              title="Annulation Gratuite"
              desc="Vos plans ont changé ? Modifiez ou annulez votre réservation sans frais jusqu'à 48h."
            />
            <SimpleFeature 
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Réservation Rapide"
              desc="Un processus 100% en ligne, rapide et sécurisé pour gagner du temps."
            />
          </div>
        </div>
      </section>

      {/* 📍 Simple Locations Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Où nous trouver ?</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['Aéroport Tétouan', 'Rabat-Salé', 'Tanger', 'Marrakech', 'Casablanca'].map((loc, idx) => (
              <div key={idx} className="p-6 bg-white border border-gray-100 rounded-xl hover:border-primary transition-colors flex flex-col items-center">
                 <MapPin className="w-6 h-6 text-gray-300 mb-4" />
                 <span className="font-bold text-gray-800 text-sm">{loc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 💬 Simple FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            <SimpleFAQItem q="Documents nécessaires ?" a="Permis de conduire, carte d'identité et carte bancaire." />
            <SimpleFAQItem q="Kilométrage ?" a="Le kilométrage illimité est inclus dans la plupart de nos offres." />
            <SimpleFAQItem q="Modification ?" a="Gratuited jusqu'à 48h avant la prise en charge." />
          </div>
        </div>
      </section>

      {/* ✍️ Blogs Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
           <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Nos derniers articles</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog: any) => (
                <Link key={blog._id} href={`/blogs/${blog.slug}`} className="group block">
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                    <img src={blog.coverImage || blog.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{blog.title}</h3>
                  <p className="text-gray-500 mt-2 text-sm line-clamp-2">{blog.excerpt}</p>
                </Link>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
}

const SimpleFeature = ({ icon, title, desc }: any) => (
  <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center">
     <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon}
     </div>
     <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
     <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const SimpleFAQItem = ({ q, a }: any) => (
  <details className="group bg-white rounded-xl border border-gray-100 overflow-hidden">
    <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-gray-900 list-none">
       {q}
       <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
    </summary>
    <div className="px-6 pb-6 text-gray-500 text-sm border-t border-gray-50 pt-4">
       {a}
    </div>
  </details>
);

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

      {/* 🚗 Category Selection Section - Ada Inspired */}
      <section className="py-20 bg-white border-b border-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quel véhicule recherchez-vous ?</h2>
            <p className="text-gray-500 text-sm font-medium">Une large gamme adaptée à tous vos besoins de mobilité au Maroc.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <CategoryCard title="Citadines" icon={<Zap className="w-5 h-5" />} count="12+ véhicules" href="/cars?category=citadine" />
            <CategoryCard title="Berlines" icon={<Compass className="w-5 h-5" />} count="8+ véhicules" href="/cars?category=berline" />
            <CategoryCard title="SUV & 4x4" icon={<Compass className="w-5 h-5" />} count="15+ véhicules" href="/cars?category=suv" />
            <CategoryCard title="Luxe" icon={<Star className="w-5 h-5" />} count="5+ véhicules" href="/cars?category=luxe" />
            <CategoryCard title="Utilitaires" icon={<Laptop className="w-5 h-5" />} count="10+ véhicules" href="/cars?category=utilitaire" />
          </div>
        </div>
      </section>

      {/* 🚗 Vehicles Section (Current) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
               <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Nos véhicules disponibles</h2>
               <div className="h-1 w-12 bg-primary mt-3 rounded-full"></div>
            </div>
            <Link href="/cars" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95">
               Tout voir
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

      {/* ✨ Nos Offres & Services - Ada Inspired */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/20 skew-x-12 translate-x-1/2"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Services Carlaville</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">Plus qu'une simple <br/> location de voiture.</h2>
              <div className="space-y-8">
                <ServiceRow 
                  title="Livraison à domicile & Aéroport" 
                  desc="Nous vous livrons votre véhicule directement à votre arrivée ou chez vous, partout au Maroc."
                />
                <ServiceRow 
                  title="Assistance Premium 24h/7j" 
                  desc="Une équipe dédiée pour vous accompagner à chaque étape de votre voyage, jour et nuit."
                />
                <ServiceRow 
                  title="Abonnement sans engagement" 
                  desc="Besoin d'un véhicule sur le long terme ? Profitez de nos offres flexibles et sans contraintes."
                />
              </div>
              <button className="mt-12 px-10 py-4 border-2 border-white/20 hover:border-primary hover:bg-primary rounded-full font-bold text-xs uppercase tracking-widest transition-all">
                Découvrir nos offres
              </button>
            </div>
            <div className="relative group">
               <div className="absolute -inset-4 bg-primary/30 rounded-3xl blur-2xl group-hover:bg-primary/50 transition-all"></div>
               <div className="relative aspect-video bg-gray-800 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                  <div className="text-center p-12">
                     <Laptop className="w-16 h-16 text-primary mx-auto mb-6 opacity-50" />
                     <p className="text-xl font-bold text-white/40 italic">Expérience 100% Digitalisée</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Nos Chiffres - Network Visibility */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatItem value="15+" label="Agences au Maroc" />
              <StatItem value="500+" label="Véhicules disponibles" />
              <StatItem value="10k+" label="Clients satisfaits" />
              <StatItem value="24/7" label="Support Client" />
           </div>
        </div>
      </section>

      {/* 📍 Nos Agences - Simplified Map/List */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Un réseau d'agences à votre écoute</h2>
            <p className="text-gray-500 text-lg">Retrouvez Carlaville dans les plus grandes villes et aéroports du Royaume.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AgencyItem city="Tanger" agencies={["Aéroport Ibn Battouta", "Tanger Ville", "Tanger Med"]} />
            <AgencyItem city="Casablanca" agencies={["Aéroport Med V", "Casa Portfolio", "Maarif"]} />
            <AgencyItem city="Marrakech" agencies={["Aéroport Menara", "Guéliz", "Hivernage"]} />
            <AgencyItem city="Rabat" agencies={["Aéroport Rabat-Salé", "Rabat Agdal"]} />
            <AgencyItem city="Agadir" agencies={["Aéroport Al Massira", "Agadir Baie"]} />
            <AgencyItem city="Fès" agencies={["Aéroport Fès-Saïss", "Fès Centre"]} />
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


const CategoryCard = ({ title, icon, count, href }: any) => (
  <Link href={href} className="group p-6 bg-white border border-gray-100 rounded-2xl hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all text-center flex flex-col items-center">
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{count}</p>
  </Link>
);

const ServiceRow = ({ title, desc }: any) => (
  <div className="flex gap-6 group">
    <div className="w-1 h-auto bg-white/10 group-hover:bg-primary transition-colors rounded-full shrink-0"></div>
    <div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const StatItem = ({ value, label }: any) => (
  <div className="text-center">
    <div className="text-4xl font-black text-gray-900 mb-2">{value}</div>
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}</div>
  </div>
);

const AgencyItem = ({ city, agencies }: any) => (
  <div className="p-8 bg-white border border-gray-100 rounded-2xl hover:border-primary transition-all">
    <div className="flex items-center gap-3 mb-6">
       <div className="p-2 bg-primary/10 rounded-lg">
          <MapPin className="w-5 h-5 text-primary" />
       </div>
       <h3 className="text-xl font-bold text-gray-900">{city}</h3>
    </div>
    <ul className="space-y-3">
      {agencies.map((agency: string, i: number) => (
        <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
          {agency}
        </li>
      ))}
    </ul>
    <button className="w-full mt-8 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary border-t border-gray-50 transition-colors">
       Détails de l'agence
    </button>
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

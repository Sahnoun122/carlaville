import VehicleCard from '../components/VehicleCard';
import Link from 'next/link';
import { Star, Clock, Laptop, ShieldCheck, CreditCard, Compass, ChevronDown, Plane } from 'lucide-react';
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

    if (!res.ok) {
      return { blogs: [] };
    }

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
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[650px] bg-red-900 flex flex-col justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-red-800 to-red-950 opacity-100 z-0 text-white overflow-hidden">
           <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
           <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 w-full max-w-5xl mt-[-80px]">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight shadow-sm drop-shadow-2xl">
            Où vous voulez,<br className="hidden md:block"/>
            quand vous voulez.
          </h1>
          <p className="text-xl md:text-3xl text-red-100 mb-14 font-medium max-w-3xl mx-auto drop-shadow-md">
            Vos déplacements simplifiés avec Carlaville
          </p>

          <HomeSearchWidget />
        </div>
      </section>

      {/* spacer for the overlapping widget */}
      <div className="h-56 md:h-40 bg-gray-50"></div>

      {/* Voitures en Vedette Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Voitures en Vedette</h2>
            <div className="h-1.5 w-32 bg-primary mx-auto rounded-full"></div>
            <p className="mt-6 text-gray-500 text-xl max-w-2xl mx-auto">
              Découvrez notre sélection premium des véhicules les plus demandés.
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
            <a href="/cars" className="inline-block bg-white border-2 border-primary text-primary font-extrabold px-10 py-4 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg text-lg">
              Voir tous les véhicules
            </a>
          </div>
        </div>
      </section>

      {/* Pourquoi Nous Choisir Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-red-50 -skew-x-12 transform origin-top-left -z-10 opacity-50"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Pourquoi Nous Choisir ?</h2>
            <div className="h-1.5 w-32 bg-primary mx-auto rounded-full"></div>
            <p className="mt-6 text-gray-500 text-xl max-w-2xl mx-auto">
              L'excellence à chaque kilomètre. Carlaville vous offre les meilleures conditions de location au Maroc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-red-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4 text-gray-900">Flotte Premium</h3>
              <p className="text-gray-500 text-lg leading-relaxed">Des véhicules récents, parfaitement entretenus et équipés pour votre plus grand confort.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-red-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4 text-gray-900">Service 24/7</h3>
              <p className="text-gray-500 text-lg leading-relaxed">Une assistance routière disponible jour et nuit pour vous garantir une tranquillité totale.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-red-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Laptop className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4 text-gray-900">Technologie de Pointe</h3>
              <p className="text-gray-500 text-lg leading-relaxed">Un processus de réservation en ligne 100% digitalisé, rapide, sécurisé et instantané.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-red-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4 text-gray-900">Flexibilité Totale</h3>
              <p className="text-gray-500 text-lg leading-relaxed">Modifiez ou annulez votre réservation facilement. Nous nous adaptons à vos imprévus.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-red-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4 text-gray-900">Tarifs Transparents</h3>
              <p className="text-gray-500 text-lg leading-relaxed">Aucun frais caché. Le prix affiché lors de la réservation est le prix final que vous paierez.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-white border border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-red-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold mb-4 text-gray-900">Expertise Locale</h3>
              <p className="text-gray-500 text-lg leading-relaxed">Forts de notre expérience au Maroc, nous vous conseillons les meilleurs itinéraires et options.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emplacements Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Meilleures locations au Maroc</h2>
            <div className="h-1.5 w-32 bg-primary mx-auto rounded-full"></div>
            <p className="mt-6 text-gray-500 text-xl max-w-2xl mx-auto">
              Nous sommes présents dans les principaux aéroports pour faciliter votre arrivée.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {['Aéroport Tétouan Saniat R’mel', 'Aéroport Rabat-Salé', 'Aéroport Tanger Ibn Battouta', 'Aéroport de Marrakech', 'Aéroport Casablanca Med V'].map((airp, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group flex flex-col items-center text-center cursor-pointer">
                <div className="w-14 h-14 bg-red-50 text-primary rounded-full flex items-center justify-center mb-4 group-hover:-translate-y-2 transition-transform duration-300">
                  <Plane className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-900">{airp}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Questions Fréquentes (FAQ)</h2>
            <div className="h-1.5 w-32 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="space-y-4">
            <details className="group bg-gray-50 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-bold text-gray-900 text-lg">
                Quels documents sont nécessaires pour louer une voiture ?
                <ChevronDown className="w-5 h-5 shrink-0 transition duration-300 group-open:-rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-500 text-lg">
                 Une carte d'identité ou un passeport valide, un permis de conduire valide depuis au moins 2 ans, et une carte de crédit à votre nom pour la caution.
              </div>
            </details>
            
            <details className="group bg-gray-50 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-bold text-gray-900 text-lg">
                Puis-je modifier ou annuler ma réservation ?
                <ChevronDown className="w-5 h-5 shrink-0 transition duration-300 group-open:-rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-500 text-lg">
                 Oui, l'annulation et la modification sont gratuites jusqu'à 48 heures avant la prise en charge du véhicule via votre espace client.
              </div>
            </details>

            <details className="group bg-gray-50 rounded-2xl [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-bold text-gray-900 text-lg">
                Le kilométrage est-il limité ?
                <ChevronDown className="w-5 h-5 shrink-0 transition duration-300 group-open:-rotate-180" />
              </summary>
              <div className="px-6 pb-6 text-gray-500 text-lg">
                 La grande majorité de nos véhicules sont loués avec l'option kilométrage illimité incluse dans le prix de base. Référez-vous aux options lors de votre réservation.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Nos Derniers Blogs</h2>
            <div className="h-1.5 w-32 bg-primary mx-auto rounded-full"></div>
            <p className="mt-6 text-gray-500 text-xl max-w-2xl mx-auto">
              Conseils de voyage, astuces location et actualités Carlaville.
            </p>
          </div>

          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog: any) => {
                const previewImage =
                  typeof blog.coverImage === 'string' && /^(https?:\/\/|\/)/i.test(blog.coverImage)
                    ? blog.coverImage
                    : blog.images?.[0];

                return (
                <Link
                  key={blog.id || blog._id || blog.slug}
                  href={`/blogs/${blog.slug}`}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={blog.title}
                      className="mb-5 h-44 w-full rounded-xl object-cover"
                    />
                  ) : null}

                  <h3 className="text-2xl font-extrabold text-gray-900 leading-tight mb-3">
                    {blog.title}
                  </h3>

                  <p className="text-gray-500 leading-relaxed mb-5 line-clamp-3">
                    {blog.excerpt}
                  </p>

                  <div className="text-sm text-gray-400">
                    {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}
                  </div>
                </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-lg">Aucun article publié pour le moment.</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/blogs"
              className="inline-block rounded-xl border-2 border-primary px-8 py-3 text-lg font-bold text-primary transition-all hover:bg-primary hover:text-white"
            >
              Voir tous les blogs
            </Link>
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
    </div>
  )
}

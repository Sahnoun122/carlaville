import VehicleCard from '../../components/VehicleCard';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Star, Clock, Laptop, ShieldCheck, CreditCard, Compass, ChevronDown, Plane, Shield, Zap, Search, MapPin } from 'lucide-react';
import BlogCard from '../../components/BlogCard';
import HomeSearchWidget from '../../components/HomeSearchWidget';
import { getTranslations } from 'next-intl/server';

async function getCars() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://carlaville-ykc8.vercel.app';
    const res = await fetch(`${API_URL}/api/cars?limit=6`, { next: { revalidate: 60 } });
    if (!res.ok) return { cars: [] };
    const data = await res.json();
    return data;
  } catch (error) {
    return { cars: [] };
  }
}

async function getBlogs() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://carlaville-ykc8.vercel.app';
    const res = await fetch(`${API_URL}/api/blogs?limit=3`, {
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
  const t = await getTranslations('home');

  return (
    <div className="w-full bg-white overflow-x-hidden">

      {/* 🚀 Premium Hero Section */}
      <section className="relative pt-20 lg:pt-32 pb-12 bg-white overflow-hidden min-h-[60vh] lg:min-h-[85vh] flex flex-col justify-center">
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-0 pb-16 lg:pb-32">
            
            {/* Left: Content */}
            <div className="w-full lg:w-[55%] text-left z-20 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-6 lg:mb-8 border border-primary/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {t('hero.badge')}
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] font-black text-gray-900 mb-6 lg:mb-8 tracking-tighter leading-[1.1] lg:leading-[0.95]">
                {t('hero.title_p1')} <br/>{t('hero.title_p2')} <span className="text-primary italic">{t('hero.title_italic')}</span>
              </h1>
              <p className="text-base lg:text-xl text-gray-400 max-w-lg leading-relaxed font-medium mb-8 lg:mb-10">
                {t('hero.subtitle')}
              </p>
              
              <div className="flex items-center gap-6 lg:gap-8 pt-2 lg:pt-4">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                       <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                       </div>
                    ))}
                 </div>
                 <p className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-widest leading-tight">
                    {t('hero.joined')}
                 </p>
              </div>
            </div>

            {/* Right: Car Image Portfolio Style */}
            <div className="w-full lg:w-[45%] relative z-10 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px] md:max-w-[700px] lg:max-w-none transform scale-[1.0] md:scale-[1.1] lg:scale-[1.25] lg:-translate-x-8 xl:-translate-x-12 translate-y-4 lg:translate-y-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
                {/* Visual Background Lines */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] opacity-15 pointer-events-none select-none">
                  <svg viewBox="0 0 200 200" className="w-full h-full text-gray-300">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                    <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>
                <Image 
                  src="/car.png" 
                  alt="CarlaVille Luxury Car" 
                  width={1400}
                  height={800}
                  className="w-full h-auto object-contain mix-blend-multiply filter contrast-[1.05] drop-shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Floating Search Widget */}
          <div className="max-w-5xl mx-auto relative z-30 -mt-8 md:-mt-16 lg:-mt-20">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-2 md:p-3 border border-gray-100">
               <HomeSearchWidget />
            </div>
          </div>
        </div>
      </section>


      {/* 🚗 Category Selection Section - Ada Inspired */}
      <section className="py-20 bg-gray-50 border-b border-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('categories.title')}</h2>
            <p className="text-gray-500 text-sm font-medium">{t('categories.subtitle')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
            <CategoryCard title={t('categories.citadines')} icon={<Zap className="w-5 h-5" />} count={t('categories.count', {count: 12})} href="/cars?category=citadine" />
            <CategoryCard title={t('categories.berlines')} icon={<Compass className="w-5 h-5" />} count={t('categories.count', {count: 8})} href="/cars?category=berline" />
            <CategoryCard title={t('categories.suv')} icon={<Compass className="w-5 h-5" />} count={t('categories.count', {count: 15})} href="/cars?category=suv" />
            <CategoryCard title={t('categories.luxe')} icon={<Star className="w-5 h-5" />} count={t('categories.count', {count: 5})} href="/cars?category=luxe" />
            <CategoryCard title={t('categories.utilitaires')} icon={<Laptop className="w-5 h-5" />} count={t('categories.count', {count: 10})} href="/cars?category=utilitaire" />
          </div>
        </div>
      </section>

      {/* 🚗 Vehicles Section (Current) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{t('vehicles.title')}</h2>
              <div className="h-1 w-12 bg-primary mt-3 rounded-full"></div>
            </div>
            <Link href="/cars" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95">
              {t('vehicles.view_all')}
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
              <p className="text-gray-400 font-medium">{t('vehicles.empty')}</p>
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
              <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4 block">{t('services.badge')}</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{t('services.title')}</h2>
              <div className="space-y-8">
                <ServiceRow
                  title={t('services.item1.title')}
                  desc={t('services.item1.desc')}
                />
                <ServiceRow
                  title={t('services.item2.title')}
                  desc={t('services.item2.desc')}
                />
                <ServiceRow
                  title={t('services.item3.title')}
                  desc={t('services.item3.desc')}
                />
              </div>
              <button className="mt-12 px-10 py-4 border-2 border-white/20 hover:border-primary hover:bg-primary rounded-full font-bold text-xs uppercase tracking-widest transition-all">
                {t('services.discover')}
              </button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/30 rounded-3xl blur-2xl group-hover:bg-primary/50 transition-all"></div>
              <div className="relative aspect-video bg-gray-800 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                <Image 
                  src="/digital-experience.png" 
                  alt={t('services.digital_exp')} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <p className="text-xl font-black text-white italic tracking-tighter">{t('services.digital_exp')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Nos Chiffres - Network Visibility */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem value="15+" label={t('stats.agencies')} />
            <StatItem value="500+" label={t('stats.vehicles')} />
            <StatItem value="10k+" label={t('stats.clients')} />
            <StatItem value="24/7" label={t('stats.support')} />
          </div>
        </div>
      </section>

      {/* 📍 Nos Agences - Simplified Map/List */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">{t('agencies.title')}</h2>
            <p className="text-gray-500 text-lg">{t('agencies.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AgencyItem city="Tanger" agencies={["Aéroport Ibn Battouta", "Tanger Ville", "Tanger Med"]} detailsLabel={t('agencies.details')} />
            <AgencyItem city="Casablanca" agencies={["Aéroport Med V", "Casa Portfolio", "Maarif"]} detailsLabel={t('agencies.details')} />
            <AgencyItem city="Marrakech" agencies={["Aéroport Menara", "Guéliz", "Hivernage"]} detailsLabel={t('agencies.details')} />
            <AgencyItem city="Rabat" agencies={["Aéroport Rabat-Salé", "Rabat Agdal"]} detailsLabel={t('agencies.details')} />
            <AgencyItem city="Agadir" agencies={["Aéroport Al Massira", "Agadir Baie"]} detailsLabel={t('agencies.details')} />
            <AgencyItem city="Fès" agencies={["Aéroport Fès-Saïss", "Fès Centre"]} detailsLabel={t('agencies.details')} />
          </div>
        </div>
      </section>

      {/* 💬 Simple FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t('faq.title')}</h2>
          <div className="space-y-4">
            <SimpleFAQItem q={t('faq.item1.q')} a={t('faq.item1.a')} />
            <SimpleFAQItem q={t('faq.item2.q')} a={t('faq.item2.a')} />
            <SimpleFAQItem q={t('faq.item3.q')} a={t('faq.item3.a')} />
          </div>
        </div>
      </section>

      {/* ✍️ Blogs Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">{t('blogs.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog: any) => (
              <BlogCard key={blog._id} blog={blog} readMoreText={t('blogs.read_more')} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


const CategoryCard = ({ title, icon, count, href }: any) => (
  <Link href={href} className="group p-6 bg-gray-50 border border-gray-100 rounded-2xl hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all text-center flex flex-col items-center">
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
      {icon}
    </div>
    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{count}</p>
  </Link>
);

const ServiceRow = ({ title, desc }: any) => (
  <div className="flex gap-6 group">
    <div className="w-1 h-auto bg-gray-50/10 group-hover:bg-primary transition-colors rounded-full shrink-0"></div>
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

const AgencyItem = ({ city, agencies, detailsLabel }: any) => (
  <div className="p-8 bg-gray-50 border border-gray-100 rounded-2xl hover:border-primary transition-all">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-primary/10 rounded-lg">
        <MapPin className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{city}</h3>
    </div>
    <ul className="space-y-3">
      {agencies.map((agency: string, i: number) => (
        <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-1.5 h-1.5 bg-gray-50 rounded-full"></div>
          {agency}
        </li>
      ))}
    </ul>
    <button className="w-full mt-8 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary border-t border-gray-50 transition-colors">
      {detailsLabel}
    </button>
  </div>
);

const SimpleFAQItem = ({ q, a }: any) => (
  <details className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
    <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-gray-900 list-none">
      {q}
      <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
    </summary>
    <div className="px-6 pb-6 text-gray-500 text-sm border-t border-gray-50 pt-4">
      {a}
    </div>
  </details>
);



import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata() {
  const t = await getTranslations('about');
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/about-hero.png"
            alt="CarLaville - Location de voitures de luxe au Maroc"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-16 animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full bg-gray-50/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wide uppercase mb-6 shadow-xl">
            {t('hero_badge')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-xl tracking-tight">
            {t('hero_title').split('CarLaville')[0]}<span className="text-primary">CarLaville</span>{t('hero_title').split('CarLaville')[1]}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 font-light leading-relaxed max-w-4xl mx-auto drop-shadow-lg">
            {t('hero_subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 space-y-32">
        
        {/* Notre Mission et Notre Histoire */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">{t('mission_title')}</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('mission_desc')}
              </p>
            </div>
            
            <div className="pl-6 border-l-4 border-primary/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{t('history_title')}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('history_desc')}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-transparent rounded-[2.5rem] transform rotate-3 z-0"></div>
            <div className="bg-gray-50 rounded-[2rem] p-8 md:p-12 relative z-10 border border-gray-100 soft-shadow">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-2xl soft-shadow text-center">
                    <div className="text-4xl font-extrabold text-primary mb-2">18+</div>
                    <div className="text-gray-600 font-medium">{t('experience_years')}</div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl soft-shadow text-center">
                    <div className="text-4xl font-extrabold text-primary mb-2">24/7</div>
                    <div className="text-gray-600 font-medium">{t('customer_support')}</div>
                  </div>
                </div>
                <div className="space-y-6 mt-8">
                  <div className="bg-gray-50 p-6 rounded-2xl soft-shadow text-center">
                    <div className="text-4xl font-extrabold text-primary mb-2">10k+</div>
                    <div className="text-gray-600 font-medium">{t('satisfied_clients')}</div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl soft-shadow text-center">
                    <div className="text-4xl font-extrabold text-primary mb-2">100%</div>
                    <div className="text-gray-600 font-medium">{t('transparency')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notre Flotte */}
        <section className="bg-gray-50 rounded-[3rem] p-8 md:p-16 lg:p-20 relative overflow-hidden my-24">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          
          <div className="text-center mb-16 relative z-10 w-full max-w-4xl mx-auto">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">{t('fleet_badge')}</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">{t('fleet_title')}</h2>
            <p className="text-xl text-gray-600">
              {t('fleet_desc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="bg-gray-50 hover:border-primary/50 transition-all duration-300 xl:cursor-pointer card-simple group">
              <div className="h-16 w-16 bg-gray-50 group-hover:bg-primary group-hover:text-white transition-colors duration-300 rounded-2xl flex items-center justify-center mb-6 text-gray-900 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('economy_title')}</h3>
              <p className="text-gray-600 text-lg">{t('economy_desc')}</p>
            </div>
            
            <div className="bg-gray-50 hover:border-primary/50 transition-all duration-300 xl:cursor-pointer card-simple group relative shadow-md scale-105 border-primary/20">
              <div className="absolute -top-4 inset-x-0 mx-auto w-32 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full text-center shadow-lg">{t('popular_badge')}</div>
              <div className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-primary/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('suv_title')}</h3>
              <p className="text-gray-600 text-lg">{t('suv_desc')}</p>
            </div>

            <div className="bg-gray-50 hover:border-primary/50 transition-all duration-300 xl:cursor-pointer card-simple group">
              <div className="h-16 w-16 bg-gray-50 group-hover:bg-primary group-hover:text-white transition-colors duration-300 rounded-2xl flex items-center justify-center mb-6 text-gray-900 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('luxury_title')}</h3>
              <p className="text-gray-600 text-lg">{t('luxury_desc')}</p>
            </div>
          </div>
        </section>

        {/* Notre Engagement et Nos Valeurs */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Notre Engagement */}
          <div className="border border-gray-100 rounded-[2.5rem] p-8 md:p-12 soft-shadow bg-gray-50">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">{t('commitment_title')}</h2>
            <p className="text-lg text-gray-600 mb-10">
              {t('commitment_desc')}
            </p>
            <ul className="space-y-8">
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{t('competitive_prices')}</h4>
                  <p className="text-gray-600 mt-2 text-lg">{t('competitive_prices_desc')}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{t('support_24h')}</h4>
                  <p className="text-gray-600 mt-2 text-lg">{t('support_24h_desc')}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{t('easy_booking')}</h4>
                  <p className="text-gray-600 mt-2 text-lg">{t('easy_booking_desc')}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mt-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{t('maintained_vehicles')}</h4>
                  <p className="text-gray-600 mt-2 text-lg">{t('maintained_vehicles_desc')}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Nos Valeurs */}
          <div className="border border-gray-100 rounded-[2.5rem] p-8 md:p-12 soft-shadow bg-gray-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight relative z-10">{t('values_title')}</h2>
            <p className="text-lg text-gray-600 mb-10 relative z-10">
              {t('values_desc')}
            </p>
            <div className="space-y-8 relative z-10">
              <div className="flex items-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-50 hover:soft-shadow transition-all group">
                <div className="w-14 h-14 bg-gray-50 shadow-sm flex items-center justify-center rounded-xl text-primary font-black text-2xl mr-6 group-hover:scale-110 transition-transform border border-gray-100">1</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{t('customer_satisfaction')}</h3>
                  <p className="text-gray-600 text-lg">{t('customer_satisfaction_desc')}</p>
                </div>
              </div>
              <div className="flex items-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-50 hover:soft-shadow transition-all group">
                <div className="w-14 h-14 bg-gray-50 shadow-sm flex items-center justify-center rounded-xl text-primary font-black text-2xl mr-6 group-hover:scale-110 transition-transform border border-gray-100">2</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{t('integrity')}</h3>
                  <p className="text-gray-600 text-lg">{t('integrity_desc')}</p>
                </div>
              </div>
              <div className="flex items-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-50 hover:soft-shadow transition-all group">
                <div className="w-14 h-14 bg-gray-50 shadow-sm flex items-center justify-center rounded-xl text-primary font-black text-2xl mr-6 group-hover:scale-110 transition-transform border border-gray-100">3</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{t('excellence')}</h3>
                  <p className="text-gray-600 text-lg">{t('excellence_desc')}</p>
                </div>
              </div>
            </div>
          </div>
          
        </section>

        {/* Contact CTA */}
        <section className="bg-primary rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern-cta" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M0 60V0H60V60H0z" fill="none" />
                  <circle cx="30" cy="30" r="1.5" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern-cta)" />
            </svg>
          </div>
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight drop-shadow-sm">{t('contact_cta_title')}</h2>
            <p className="text-xl md:text-2xl text-white/90 font-medium mb-12 leading-relaxed max-w-3xl mx-auto drop-shadow-sm">
              {t('contact_cta_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/contact" className="bg-gray-50 text-primary hover:bg-gray-50 font-extrabold text-lg py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-[0.98] whitespace-nowrap">
                {t('contact_btn')}
              </Link>
              <Link href="/cars" className="bg-black/20 hover:bg-black/30 backdrop-blur-sm border border-white/30 text-white font-extrabold text-lg py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-[0.98] whitespace-nowrap">
                {t('rent_btn')}
              </Link>
            </div>
          </div>
        </section>
        
        {/* Footer spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}

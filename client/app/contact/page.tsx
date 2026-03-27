import Image from 'next/image';

export const metadata = {
  title: 'Contactez-nous - CarLaville',
  description: 'Prenez contact avec CarLaville pour toute question, réservation ou assistance concernant nos services de location de voitures au Maroc.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/contact-hero.png"
            alt="Contactez CarLaville"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16 animate-fade-in">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-white text-sm font-semibold tracking-wide uppercase mb-6 shadow-xl">
            Assistance experte 24/7
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-xl tracking-tight">
            Contactez-<span className="text-primary">Nous</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
            Notre équipe est à votre entière disposition pour vous accompagner dans la préparation de votre voyage au Maroc.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Informations de contact */}
          <div className="space-y-12 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">Nos Coordonnées</h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                N'hésitez pas à nous contacter pour toute question, demande de devis sur-mesure ou pour finaliser la réservation de votre véhicule dès aujourd'hui.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 soft-shadow group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-gray-50 rounded-xl shadow-sm flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Téléphone</h3>
                <p className="text-gray-600 font-medium">+212 5 22 00 00 00</p>
                <p className="text-sm text-gray-500 mt-2">Assistance 24/7</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 soft-shadow group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-gray-50 rounded-xl shadow-sm flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 font-medium truncate" title="contact@carlaville.ma">contact@carlaville.ma</p>
                <p className="text-sm text-gray-500 mt-2">Réponse sous 24h</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 soft-shadow group hover:-translate-y-1 transition-all duration-300 sm:col-span-2 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-5 w-32 h-32 transform translate-x-10 translate-y-10">
                  <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"></path></svg>
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl shadow-sm flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Agence Principale</h3>
                  <p className="text-gray-600 font-medium">123 Boulevard d'Anfa, Casablanca, Maroc</p>
                  <p className="text-sm text-gray-500 mt-2">Du Lundi au Samedi, 08:00 - 19:00</p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Suivez notre actualité</h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-gray-50 border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:border-primary hover:text-white hover:scale-110 transition-all duration-300">
                   <span className="font-bold text-lg">f</span>
                </a>
                <a href="#" className="w-12 h-12 bg-gray-50 border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:border-primary hover:text-white hover:scale-110 transition-all duration-300">
                   <span className="font-bold text-lg">in</span>
                </a>
                <a href="#" className="w-12 h-12 bg-gray-50 border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-gray-600 hover:bg-primary hover:border-primary hover:text-white hover:scale-110 transition-all duration-300">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.88z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 soft-shadow relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3 relative z-10 tracking-tight">Envoyez-nous un message</h2>
              <p className="text-gray-600 mb-8 relative z-10 text-lg">Nous vous répondrons dans les plus brefs délais.</p>
              
              <form className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900">Prénom</label>
                    <input type="text" id="firstName" className="input-premium focus:ring-[3px]" placeholder="Prénom" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900">Nom</label>
                    <input type="text" id="lastName" className="input-premium focus:ring-[3px]" placeholder="Nom" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900">Adresse Email</label>
                  <input type="email" id="email" className="input-premium focus:ring-[3px]" placeholder="votre@email.com" required />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-900">Sujet détaillé</label>
                  <select id="subject" className="input-premium focus:ring-[3px] appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1.2em_1.2em] xl:cursor-pointer" style={{ backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 stroke=%22currentColor%22 viewBox=%220 0 24 24%22%3e%3cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22M19 9l-7 7-7-7%22/%3e%3c/svg%3e')" }}>
                    <option value="" disabled defaultValue="">Sélectionnez un sujet</option>
                    <option value="reservation">Réservation d'un véhicule</option>
                    <option value="info">Informations générales</option>
                    <option value="support">Support client / Assistance</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900">Message</label>
                  <textarea id="message" rows={5} className="input-premium focus:ring-[3px] resize-none" placeholder="Comment pouvons-nous vous aider ?" required></textarea>
                </div>
                
                <button type="submit" className="w-full btn-premium flex items-center justify-center gap-2 group mt-8 py-4 text-lg">
                  <span>Envoyer le message</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}


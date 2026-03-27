import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 mt-20 w-full border-t border-white/5">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <h3 className="text-2xl font-black mb-6 tracking-tighter text-white">
            Carla<span className="text-primary italic">Ville</span>
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Location de voitures de prestige au Maroc. Profitez de tarifs imbattables et d'un service client d'exception.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-500">Liens Rapides</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-primary transition-colors">Accueil</Link></li>
            <li><Link href="/cars" className="hover:text-primary transition-colors">Nos Véhicules</Link></li>
            <li><Link href="/dashboard" className="hover:text-primary transition-colors">Mon Compte</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-500">Contact</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-center gap-3">
              <span className="text-primary">📍</span> Casablanca, Maroc
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">📞</span> +212 6 00 00 00 00
            </li>
            <li className="flex items-center gap-3">
              <span className="text-primary">✉️</span> contact@carlaville.ma
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-500">Newsletter</h4>
          <p className="text-gray-400 text-xs mb-4">Inscrivez-vous pour nos offres exclusives.</p>
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 focus-within:border-primary transition-colors">
            <input 
              type="email" 
              placeholder="votre@email.com" 
              className="px-3 py-2 bg-transparent text-white w-full focus:outline-none placeholder:text-gray-600 text-xs" 
            />
            <button className="bg-primary px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all active:scale-95">Ok</button>
          </div>
        </div>
      </div>
      <div className="mt-16 text-center text-[10px] text-gray-600 border-t border-white/5 pt-8 font-bold uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Carlaville Car Rental. Tous droits réservés.
      </div>
    </footer>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-12 w-full">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4 text-primary">Carlaville<span className="text-white/80">.ma</span></h3>
          <p className="text-gray-400 text-sm">
            Location de voitures au Maroc. Des tarifs imbattables avec le meilleur service client. Inspiré par ADA.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Liens Rapides</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/" className="hover:text-white transition-colors">Accueil</a></li>
            <li><a href="/cars" className="hover:text-white transition-colors">Nos Véhicules</a></li>
            <li><a href="/dashboard" className="hover:text-white transition-colors">Mon Dashboard</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>📍 Casablanca, Maroc</li>
            <li>📞 +212 6 00 00 00 00</li>
            <li>✉️ contact@carlaville.ma</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Newsletter</h4>
          <div className="flex">
            <input type="email" placeholder="Votre email" className="px-3 py-2 bg-gray-800 text-white rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-primary" />
            <button className="bg-primary px-4 py-2 rounded-r-md font-semibold hover:bg-primary-hover transition-colors">Ok</button>
          </div>
        </div>
      </div>
      <div className="mt-12 text-center text-sm text-gray-500 border-t border-gray-800 pt-6">
        &copy; {new Date().getFullYear()} Carlaville. Tous droits réservés.
      </div>
    </footer>
  );
}

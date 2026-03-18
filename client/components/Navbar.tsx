import Link from 'next/link';
import { User, Car, Calendar, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 w-full shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Car className="w-6 h-6" />
          Carlaville<span className="text-white/80">.ma</span>
        </Link>
        <nav className="hidden md:flex gap-6 font-medium">
          <Link href="/" className="hover:text-white/80 transition-colors">Accueil</Link>
          <Link href="/cars" className="hover:text-white/80 transition-colors">Véhicules</Link>
          <Link href="/blogs" className="hover:text-white/80 transition-colors">Blogs</Link>
          <Link href="/about" className="hover:text-white/80 transition-colors">À Propos</Link>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/auth/login" className="text-sm font-semibold hover:underline flex items-center gap-1">
            <User className="w-4 h-4" /> Connexion
          </Link>
          <Link href="/auth/register" className="text-sm font-semibold bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
            S'inscrire
          </Link>
        </div>
        <button className="md:hidden">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}

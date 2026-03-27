"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Car, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const syncAuthState = () => {
      const token = localStorage.getItem('carlaville_token');
      setIsAuthenticated(Boolean(token));
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    syncAuthState();
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAuthPage = pathname?.startsWith('/auth');

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || isAuthPage 
        ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100 py-3 shadow-sm' 
        : 'lg:bg-transparent lg:border-transparent lg:py-5 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="group flex items-center gap-0.5"
        >
          <span className="text-xl font-bold tracking-tighter text-gray-900 transition-colors group-hover:text-primary">
            Carla
          </span>
          <div className="relative flex items-center justify-center">
             <div className="w-7 h-7 bg-primary rounded-full absolute"></div>
             <span className="relative text-white z-10 font-black text-lg">V</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-gray-900 transition-colors group-hover:text-primary">
            ille
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          <NavLink href="/" active={pathname === '/'}>Accueil</NavLink>
          <NavLink href="/cars" active={pathname.startsWith('/cars')}>Véhicules</NavLink>
          <NavLink href="/blogs" active={pathname.startsWith('/blogs')}>Blogs</NavLink>
          <NavLink href="/about" active={pathname === '/about'}>À Propos</NavLink>
        </nav>

        <div className="hidden lg:flex items-center gap-8">
          {isAuthenticated ? (
            <Link 
              href="/dashboard" 
              className="px-6 py-2.5 bg-neutral-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/20 active:scale-95"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-8">
              <Link 
                href="/auth/login" 
                className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] hover:text-red-600 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Connexion
              </Link>
              <Link 
                href="/auth/register" 
                className="px-6 py-2.5 bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-900 transition-all shadow-lg shadow-red-600/20 active:scale-95"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-gray-900 bg-gray-100 rounded-xl transition-all active:scale-95"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Enhanced with Glassmorphism */}
      <div className={`lg:hidden fixed inset-x-0 top-[72px] bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-2xl transition-all duration-500 ease-in-out origin-top z-40 ${
        mobileMenuOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-0 -translate-y-4 pointer-events-none'
      }`}>
          <div className="p-8 flex flex-col gap-8">
            <nav className="flex flex-col gap-6">
              <MobileNavLink href="/" active={pathname === '/'}>Accueil</MobileNavLink>
              <MobileNavLink href="/cars" active={pathname.startsWith('/cars')}>Véhicules</MobileNavLink>
              <MobileNavLink href="/blogs" active={pathname.startsWith('/blogs')}>Articles & Conseils</MobileNavLink>
              <MobileNavLink href="/about" active={pathname === '/about'}>L'agence Carlaville</MobileNavLink>
            </nav>
            
            <div className="pt-8 border-t border-gray-100 flex flex-col gap-4">
               {isAuthenticated ? (
                 <Link 
                   href="/dashboard" 
                   className="w-full py-4 bg-gray-900 text-white text-center font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-gray-200"
                 >
                   Accéder au Dashboard
                 </Link>
               ) : (
                 <>
                   <Link 
                     href="/auth/login" 
                     className="w-full py-4 text-center font-black text-gray-900 bg-gray-50 rounded-2xl text-xs uppercase tracking-widest border border-gray-100"
                   >
                     Se Connecter
                   </Link>
                   <Link 
                     href="/auth/register" 
                     className="w-full py-4 bg-red-600 text-white text-center font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-red-500/20"
                   >
                     Créer un compte
                   </Link>
                 </>
               )}
            </div>
          </div>
      </div>
    </header>
  );
}

const NavLink = ({ href, children, active }: any) => (
  <Link 
    href={href} 
    className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative group ${
      active ? 'text-red-600' : 'text-neutral-400 hover:text-neutral-900'
    }`}
  >
    {children}
    <span className={`absolute -bottom-1.5 left-0 w-full h-0.5 bg-red-600 rounded-full transition-all duration-300 ${
      active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-50 group-hover:opacity-50'
    }`}></span>
  </Link>
);

const MobileNavLink = ({ href, children, active }: any) => (
  <Link 
    href={href} 
    className={`text-lg font-black tracking-tight ${
      active ? 'text-red-600' : 'text-neutral-900'
    }`}
  >
    {children}
  </Link>
);


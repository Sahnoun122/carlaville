"use client";

import { useEffect, useState } from 'react';
import { User, Menu, X, Globe, ChevronDown, LogOut } from 'lucide-react';
import { usePathname, useRouter, Link, routing } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const { isAuthenticated, logout, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
  }, [pathname]);

  const isAuthPage = pathname?.startsWith('/auth');

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setLangMenuOpen(false);
  };

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'it', name: 'Italiano' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' }
  ];

  const currentLangName = languages.find(l => l.code === locale)?.name || 'Français';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || isAuthPage
          ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100 py-3 shadow-sm'
          : 'lg:bg-transparent lg:border-transparent lg:py-5 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-3'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-0.5"
        >
          <span className="text-xl font-bold tracking-tighter text-black transition-colors group-hover:text-primary">
            Carla
          </span>
          <div className="relative flex items-center justify-center">
            <div className="w-7 h-7 bg-primary rounded-full absolute"></div>
            <span className="relative text-white z-10 font-black text-lg">V</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-black transition-colors group-hover:text-primary">
            ille
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          <NavLink href="/" active={pathname === '/'}>{t('home')}</NavLink>
          <NavLink href="/cars" active={pathname.startsWith('/cars')}>{t('cars')}</NavLink>
          <NavLink href="/blogs" active={pathname.startsWith('/blogs')}>{t('articles')}</NavLink>
          <NavLink href="/about" active={pathname === '/about'}>{t('about')}</NavLink>
        </nav>

        <div className="hidden lg:flex items-center gap-6">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[10px] font-black uppercase tracking-widest text-gray-600"
            >
              <Globe className="w-4 h-4" />
              <span>{locale.toUpperCase()}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLocaleChange(lang.code)}
                    className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors hover:bg-gray-50 flex items-center justify-between ${locale === lang.code ? 'text-primary' : 'text-gray-600'
                      }`}
                  >
                    {lang.name}
                    {locale === lang.code && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-gray-200" />

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-neutral-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-primary transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5" />
                {user?.firstName || t('dashboard')}
              </Link>
              <button
                onClick={() => logout()}
                className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/auth/login"
                className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] hover:text-primary transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" /> {t('login')}
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2.5 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-neutral-900 transition-all shadow-lg active:scale-95"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 text-black bg-gray-100 rounded-xl transition-all active:scale-95"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-x-0 top-[72px] bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-2xl transition-all duration-500 ease-in-out origin-top z-40 ${mobileMenuOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-0 -translate-y-4 pointer-events-none'
        }`}>
        <div className="p-8 flex flex-col gap-8">
          <nav className="flex flex-col gap-6">
            <MobileNavLink href="/" active={pathname === '/'}>{t('home')}</MobileNavLink>
            <MobileNavLink href="/cars" active={pathname.startsWith('/cars')}>{t('cars')}</MobileNavLink>
            <MobileNavLink href="/blogs" active={pathname.startsWith('/blogs')}>{t('articles')}</MobileNavLink>
            <MobileNavLink href="/about" active={pathname === '/about'}>{t('about')}</MobileNavLink>
          </nav>

          <div className="flex flex-wrap gap-2 pt-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLocaleChange(lang.code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${locale === lang.code
                    ? 'bg-primary border-primary text-white'
                    : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-300'
                  }`}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="w-full py-4 bg-gray-900 text-white text-center font-black rounded-2xl text-xs uppercase tracking-widest"
              >
                {t('dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="w-full py-4 text-center font-black text-black bg-gray-50 rounded-2xl text-xs uppercase tracking-widest border border-gray-100"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full py-4 bg-primary text-white text-center font-black rounded-2xl text-xs uppercase tracking-widest"
                >
                  {t('register')}
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
    className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative group ${active ? 'text-primary' : 'text-neutral-400 hover:text-black'
      }`}
  >
    {children}
    <span className={`absolute -bottom-1.5 left-0 w-full h-0.5 bg-primary rounded-full transition-all duration-300 ${active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-50 group-hover:opacity-50'
      }`}></span>
  </Link>
);

const MobileNavLink = ({ href, children, active }: any) => (
  <Link
    href={href}
    className={`text-lg font-black tracking-tight ${active ? 'text-primary' : 'text-black'
      }`}
  >
    {children}
  </Link>
);



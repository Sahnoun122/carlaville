"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';

function RegisterForm() {
  const t = useTranslations('auth.register');
  const tl = useTranslations('auth.login');
  const router = useRouter();
  const { login } = useAuth();

  const searchParams = useSearchParams();
  const redirectParams = searchParams.get('redirect') || '/dashboard';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const phone = formData.get('phone');

    try {
      const res = await fetch('http://localhost:3009/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, phone })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || t('error_generic'));
      }

      const data = await res.json();
      login(data);
      router.push(redirectParams);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#f9fafb]">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-50/50 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-50/30 rounded-full blur-[100px] -ml-24 -mb-24"></div>
      
      <div className="max-w-xl w-full relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-gray-50 p-10 lg:p-14 rounded-[3.5rem] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)]">
          <div className="text-center mb-12">
            <div className="inline-flex w-16 h-16 bg-neutral-900 rounded-2xl items-center justify-center text-white mb-8 shadow-lg shadow-neutral-900/20 hover:scale-110 transition-transform">
              <UserPlus className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black text-neutral-900 tracking-tighter mb-3">{t('title')}</h2>
            <p className="text-gray-400 font-medium text-sm">{t('subtitle')}</p>
          </div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center border border-red-100 animate-in shake-x duration-500">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t('first_name')}</label>
                <input name="firstName" type="text" required className="input-premium" placeholder="Jean" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t('last_name')}</label>
                <input name="lastName" type="text" required className="input-premium" placeholder="Dupont" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{tl('email_label')}</label>
                <input name="email" type="email" required className="input-premium" placeholder="name@example.com" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{t('phone')}</label>
                <input name="phone" type="tel" required className="input-premium" placeholder="+212 ..." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{tl('password_label')}</label>
                <input name="password" type="password" required className="input-premium" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-premium w-full group relative overflow-hidden">
              <div className="absolute inset-0 bg-gray-50/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>{t('submit')} <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /></>
                )}
              </span>
            </button>
            
            <div className="text-center pt-8 border-t border-gray-50">
              <p className="text-sm font-medium text-gray-400">
                {t('already_member')}{' '}
                <Link href="/auth/login" className="font-black text-red-600 hover:text-neutral-900 transition-colors">{t('login_link')}</Link>
              </p>
            </div>
          </form>
        </div>
        
        <p className="mt-10 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
          {t('footer')}
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const t = useTranslations('common');
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-gray-300 uppercase tracking-widest text-xs">{t('loading')}</div>}>
      <RegisterForm />
    </Suspense>
  );
}

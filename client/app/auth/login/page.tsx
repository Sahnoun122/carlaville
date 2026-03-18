"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Car } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get('redirect') || '/dashboard';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await fetch('http://localhost:3009/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error('Email ou mot de passe incorrect');
      }

      const data = await res.json();
      localStorage.setItem('carlaville_token', data.accessToken);
      localStorage.setItem('carlaville_user', JSON.stringify(data.user));
      
      router.push(redirectParams);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl shadow-red-900/5 border-t-4 border-primary">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Connexion</h2>
          <p className="mt-2 text-sm text-gray-600">Connectez-vous à votre espace client</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-primary p-3 rounded-lg text-sm text-center font-semibold">{error}</div>}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="sr-only">Email</label>
              <input name="email" type="email" required className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Adresse email" />
            </div>
            <div>
              <label className="sr-only">Mot de passe</label>
              <input name="password" type="password" required className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Mot de passe" />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-colors shadow-md">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600">Pas encore de compte ?</span>{' '}
            <Link href={`/auth/register?redirect=${encodeURIComponent(redirectParams)}`} className="font-semibold text-primary hover:text-red-700">Créer un compte</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  );
}

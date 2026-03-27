"use client";
import { useEffect, useState, use } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/payment/CheckoutForm';
import { ShieldCheck, ArrowLeft, Loader2, Lock, CreditCard } from 'lucide-react';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIntent = async () => {
      try {
        const res = await fetch('http://localhost:3009/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservationId: id }),
        });
        if (!res.ok) throw new Error('Échec');
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIntent();
  }, [id]);

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary mb-10">
           <ArrowLeft className="w-4 h-4" /> Retour au compte
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
           <div className="space-y-6">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 soft-shadow space-y-6">
                 <div className="space-y-2">
                    <span className="px-2 py-0.5 bg-red-50 text-[10px] font-bold text-primary border border-red-100 rounded uppercase tracking-wider">Paiement Sécurisé</span>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Finaliser ma réservation</h1>
                 </div>
                 
                 <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Référence</p>
                    <p className="text-lg font-black text-gray-900">#{id.slice(-8).toUpperCase()}</p>
                 </div>

                 <div className="space-y-4">
                    <Benefit icon={<Lock className="w-4 h-4" />} text="Cryptage SSL sécurisé" />
                    <Benefit icon={<ShieldCheck className="w-4 h-4" />} text="Confirmation instantanée" />
                    <Benefit icon={<CreditCard className="w-4 h-4" />} text="Paiement via Stripe" />
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-2xl border border-gray-100 soft-shadow">
              {loading ? (
                 <div className="flex flex-col items-center py-20 animate-pulse">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Initialisation...</p>
                 </div>
              ) : error ? (
                 <div className="text-center py-10 bg-red-50 rounded-xl text-red-600 border border-red-100 italic font-medium px-4">
                    Erreur d'initialisation du paiement.
                 </div>
              ) : (
                clientSecret && (
                  <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                     <div className="space-y-6">
                        <CheckoutForm reservationId={id} />
                        <p className="text-[10px] text-gray-400 text-center font-medium mt-6">Vos données bancaires sont traitées de manière sécurisée par Stripe.</p>
                     </div>
                  </Elements>
                )
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

const Benefit = ({ icon, text }: any) => (
  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
     <div className="text-primary opacity-60">{icon}</div>
     {text}
  </div>
);

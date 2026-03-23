"use client";
import { useEffect, useState, use } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/payment/CheckoutForm';
import { CreditCard, ShieldCheck, ArrowLeft } from 'lucide-react';
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

        if (!res.ok) throw new Error('Failed to create payment intent');

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

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#dc2626', // Carlaville red
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        <Link href={`/dashboard`} className="flex items-center text-gray-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-primary p-6 text-white flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Paiement sécurisé</h1>
              <p className="text-red-100 text-sm opacity-90">Réservation #{id.slice(-6).toUpperCase()}</p>
            </div>
            <ShieldCheck className="w-10 h-10 text-white/20" />
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-500 font-medium">Chargement du paiement...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-primary p-4 rounded-xl text-center border border-red-100">
                <p className="font-bold mb-2">Une erreur est survenue</p>
                <p className="text-sm">{error}</p>
              </div>
            ) : (
              clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                  <CheckoutForm reservationId={id} />
                </Elements>
              )
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400 text-xs">
              <CreditCard className="w-4 h-4" />
              <span>Paiement crypté SSL par Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

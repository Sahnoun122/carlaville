"use client";

import { useEffect, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import {
   MapPin,
   Car,
   Calendar,
   Clock,
   ChevronRight,
   Wallet,
   LogOut,
   ArrowUpRight,
   Plus,
   ShieldCheck,
   Navigation,
   Zap,
   CircleDollarSign,
   Compass,
   CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';

const resolveReservationId = (reservation: { id?: string; _id?: string }) => reservation.id || reservation._id || '';

const formatDate = (value?: string) => {
   const date = new Date(String(value ?? ''));
   return Number.isNaN(date.getTime()) ? 'Date indisponible' : date.toLocaleDateString();
};

const activeWorkflowStatuses = [
   'confirmed',
   'ready-for-delivery',
   'in-delivery',
   'delivered',
   'active-rental',
   'return-scheduled',
];

const statusLabels: Record<string, string> = {
   pending: 'En attente',
   confirmed: 'Confirmée',
   rejected: 'Rejetée',
   'ready-for-delivery': 'Prête livraison',
   'in-delivery': 'En livraison',
   delivered: 'Livrée',
   'active-rental': 'Location active',
   'return-scheduled': 'Retour programmé',
   returned: 'Restituée',
   completed: 'Terminée',
   cancelled: 'Annulée',
};

const resolveStatusLabel = (status?: string) => statusLabels[status || ''] || status || 'Inconnu';

interface DashboardReservation {
   id?: string;
   _id?: string;
   status: string;
   bookingReference?: string;
   pickupLocation?: string;
   pickupDate?: string;
   returnDate?: string;
   pricingBreakdown?: {
      total?: number;
   };
   carId?: {
      brand?: string;
      model?: string;
      imageUrl?: string;
      images?: string[];
   };
}

export default function DashboardPage() {
   const { user } = useAuth();
   const [reservations, setReservations] = useState<DashboardReservation[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      async function fetchReservations() {
         const token = localStorage.getItem('carlaville_token');
         try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://carlaville-ykc8.vercel.app';
            const res = await fetch(`${API_URL}/api/client/reservations?limit=100`, {
               headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
               const data = await res.json();
               setReservations(data.reservations || []);
            }
         } catch (err) {
            console.error(err);
         } finally {
            setLoading(false);
         }
      }
      fetchReservations();
   }, []);

   const stats = useMemo(() => {
      const totalSpent = reservations.reduce((acc, res) => acc + (res.pricingBreakdown?.total || 0), 0);
      const active = reservations.filter((res) => activeWorkflowStatuses.includes(res.status)).length;
      return {
         total: reservations.length,
         active,
         totalSpent,
         points: Math.floor(totalSpent / 100)
      };
   }, [reservations]);

   if (loading) return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
         <div className="w-16 h-16 border-8 border-red-50 border-t-red-600 rounded-full animate-spin mb-6 shadow-xl shadow-red-200"></div>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Initialisation du Centre de Pilotage...</p>
      </div>
   );

   const activeReservation = reservations.find((r) => activeWorkflowStatuses.includes(r.status)) || reservations[0];

   return (
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20 px-4">

         {/* Dynamic Header */}
         <div className="relative group mt-6 md:mt-12">
            <div className="absolute -inset-1 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-r from-red-600 to-amber-500 rounded-[2rem] md:rounded-[3rem]"></div>
            <div className="relative bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-10">
                  <div>
                     <div className="flex items-center gap-3 mb-4">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Command Center v2.0</span>
                     </div>
                     <h1 className="text-3xl md:text-5xl font-black text-neutral-900 tracking-tighter leading-none mb-4">
                        Bonjour, <span className="text-red-600 italic">{user?.firstName}</span>
                     </h1>
                     <p className="text-gray-400 font-bold text-sm leading-relaxed max-w-lg italic">
                        Votre voyage, sous contrôle total. Gérez votre flotte personnelle et trackez vos locations en temps réel.
                     </p>
                  </div>
                  <Link href="/cars" className="group">
                     <div className="px-8 py-5 bg-neutral-900 text-white rounded-2xl flex items-center gap-4 font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-neutral-900/30 transition-all hover:bg-neutral-800 hover:-translate-y-1 active:scale-95">
                        <Plus className="w-4 h-4 text-red-500 group-hover:rotate-90 transition-transform duration-500" />
                        Nouvelle Expérience
                     </div>
                  </Link>
               </div>
            </div>
         </div>

         {/* Modern KPI Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
               icon={<CircleDollarSign className="w-6 h-6" />}
               label="Patrimoine Voyage"
               value={`${stats.totalSpent.toLocaleString()} MAD`}
               trend="+12% vs mois dernier"
               gradient="from-emerald-500/10 to-emerald-500/5"
            />
            <StatsCard
               icon={<Navigation className="w-6 h-6" />}
               label="État Flotte"
               value={`${stats.active} Active(s)`}
               trend="1 en attente de livraison"
               gradient="from-red-600/10 to-red-600/5"
            />
            <StatsCard
               icon={<Zap className="w-6 h-6" />}
               label="Points Privilège"
               value={`${stats.points} pts`}
               trend="Statut: Platinum Member"
               gradient="from-amber-500/10 to-amber-500/5"
            />
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Strategic Tracker (Left) */}
            <div className="lg:col-span-8 space-y-8">
               <div className="flex items-center justify-between mb-2 px-2">
                  <h3 className="text-xl font-black text-neutral-900 tracking-tight italic flex items-center gap-3">
                     <Compass className="w-5 h-5 text-red-600" /> Journey Tracker
                  </h3>
                  <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">Temps Réel</span>
               </div>

               {activeReservation ? (
                  <div className="space-y-6">
                     <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.03)] group hover:shadow-xl hover:shadow-gray-200/20 transition-all duration-700">
                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">
                           <div className="relative shrink-0 w-full md:w-56 overflow-hidden flex items-center justify-center pt-5">
                              <div className="absolute inset-0 bg-gray-50 rounded-3xl -rotate-1 group-hover:rotate-1 transition-transform"></div>
                              {(activeReservation.carId?.images?.[0] || activeReservation.carId?.imageUrl) ? (
                                 <img
                                    src={activeReservation.carId?.images?.[0] || activeReservation.carId?.imageUrl}
                                    className="relative z-10 w-full h-auto object-contain transform group-hover:scale-110 transition-transform duration-700 -translate-y-4"
                                    alt=""
                                 />
                              ) : <Car className="w-12 h-12 text-gray-200 relative z-10" />}
                           </div>

                           <div className="flex-1 space-y-6 w-full">
                              <div className="flex justify-between items-start">
                                 <div className="space-y-1">
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                                       {resolveStatusLabel(activeReservation.status)}
                                    </span>
                                    <h4 className="text-2xl font-black text-neutral-900 tracking-tighter">{activeReservation.carId?.brand} {activeReservation.carId?.model}</h4>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] font-black text-neutral-300 uppercase leading-none">Booking ID</p>
                                    <p className="text-sm font-black text-neutral-900 tracking-tight"># {activeReservation.bookingReference}</p>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 py-6 border-y border-gray-50">
                                 <DetailItem label="Lieu Retrait" value={activeReservation.pickupLocation} icon={<MapPin className="w-3.5 h-3.5" />} />
                                 <DetailItem label="Période" value={`${formatDate(activeReservation.pickupDate)} - ${formatDate(activeReservation.returnDate)}`} icon={<Calendar className="w-3.5 h-3.5" />} />
                                 <div className="col-span-2 md:col-span-1">
                                    <DetailItem label="Total Brute" value={`${(activeReservation.pricingBreakdown?.total || 0).toLocaleString()} MAD`} icon={<CircleDollarSign className="w-3.5 h-3.5 text-red-600" />} />
                                 </div>
                              </div>

                              {/* Visual Timeline (Premium Stepper) */}
                              <div className="pt-8">
                                 <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] mb-8 text-center md:text-left">Progression Logistique</p>
                                 <div className="relative flex justify-between gap-2 max-w-3xl mx-auto md:mx-0">
                                    <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-50"></div>
                                    <div className="absolute top-4 left-0 h-[2px] bg-red-600 transition-all duration-1000 origin-left" style={{ width: getProgressWidth(activeReservation.status) }}></div>

                                    <StepNode label="Validé" active={['confirmed', 'ready-for-delivery', 'in-delivery', 'delivered', 'active-rental', 'return-scheduled', 'returned', 'completed'].includes(activeReservation.status)} />
                                    <StepNode label="Livraison" active={['ready-for-delivery', 'in-delivery', 'delivered', 'active-rental', 'return-scheduled', 'returned', 'completed'].includes(activeReservation.status)} />
                                    <StepNode label="Active" active={['active-rental', 'return-scheduled', 'returned', 'completed'].includes(activeReservation.status)} />
                                    <StepNode label="Finalisation" active={['returned', 'completed'].includes(activeReservation.status)} />
                                 </div>
                              </div>

                              <div className="pt-6">
                                 <Link
                                    href={`/checkout/${resolveReservationId(activeReservation)}`}
                                    className="w-full md:w-auto px-10 py-3.5 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 group"
                                 >
                                    Consulter le suivi <ChevronRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
                                 </Link>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="relative p-20 text-center rounded-[3rem] border-2 border-dashed border-gray-100 bg-white/50 group overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <Car className="w-12 h-12 text-gray-200 mx-auto mb-6 group-hover:rotate-6 transition-transform" />
                     <p className="text-gray-400 font-bold italic tracking-tight mb-8">Aucune expédition active pour le moment.</p>
                     <Link href="/cars" className="inline-flex h-12 items-center px-10 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-neutral-900/10 hover:-translate-y-1 active:scale-95 transition-all">
                        Lancer une Recherche
                     </Link>
                  </div>
               )}
            </div>

            {/* Strategic Support (Right) */}
            <div className="lg:col-span-4 space-y-8 md:space-y-10">
               <div className="bg-neutral-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] text-white shadow-2xl shadow-neutral-900/40 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-[60px] -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                  <div className="relative z-10 space-y-8">
                     <div className="flex items-center gap-3">
                        <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
                        <h3 className="text-lg font-black tracking-tight italic">Travel Assistant</h3>
                     </div>

                     <div className="space-y-6">
                        <InsightCard
                           icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
                           text="Votre assurance premium Carla Ville est active sur tous vos prochains trajets."
                        />
                        <InsightCard
                           icon={<CheckCircle2 className="w-5 h-5 text-red-500" />}
                           text="N'oubliez pas votre permis original pour le retrait à Agadir."
                        />
                        <InsightCard
                           icon={<Clock className="w-5 h-5 text-amber-400" />}
                           text="Le saviez-vous ? Vous bénéficiez d'une attente prioritaire en agence."
                        />
                     </div>

                     <div className="pt-4">
                        <button onClick={handleLogout} className="w-full h-12 border border-white/10 rounded-2xl flex items-center justify-between px-6 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-neutral-900 transition-all group">
                           Déconnexion <LogOut className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Docs & Invoices</h4>
                     <ArrowUpRight className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="space-y-4">
                     {[1, 2].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-red-100 hover:bg-red-50/50 transition-all cursor-pointer group">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                 <Wallet className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-600 transition-colors" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Invoice_00{i}.pdf</span>
                           </div>
                           <span className="text-[9px] font-black text-neutral-300">FEB 2024</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

      </div>
   );
}

const StatsCard = ({
   icon,
   label,
   value,
   trend,
   gradient,
}: {
   icon: ReactNode;
   label: string;
   value: string;
   trend: string;
   gradient: string;
}) => (
   <div className={`relative p-8 rounded-[2.5rem] border border-gray-100 bg-white shadow-[0_15px_40px_-15px_rgba(0,0,0,0.02)] overflow-hidden group hover:-translate-y-1 transition-all duration-500`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      <div className="relative z-10">
         <div className="w-12 h-12 bg-gray-50 text-neutral-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-white group-hover:shadow-md transition-all group-hover:rotate-3">
            {icon}
         </div>
         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{label}</p>
         <p className="text-2xl font-black text-neutral-900 tracking-tight mb-2 italic">{value}</p>
         <p className="text-[10px] font-bold text-neutral-300 italic uppercase leading-none">{trend}</p>
      </div>
   </div>
);

const DetailItem = ({
   label,
   value,
   icon,
}: {
   label: string;
   value?: string;
   icon: ReactNode;
}) => (
   <div className="flex items-start gap-3 group">
      <div className="w-8 h-8 shrink-0 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-all shadow-sm">
         {icon}
      </div>
      <div>
         <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest leading-none mb-1">{label}</p>
         <p className="text-xs font-black text-neutral-900 break-words">{value}</p>
      </div>
   </div>
);

const StepNode = ({ label, active }: { label: string, active: boolean }) => (
   <div className="relative z-10 flex flex-col items-center gap-3">
      <div className={`w-9 h-9 rounded-full border-4 flex items-center justify-center shadow-sm transition-all duration-700 ${active ? 'bg-red-600 border-white scale-110' : 'bg-white border-gray-50'
         }`}>
         {active && <CheckCircle2 className="w-4 h-4 text-white" />}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${active ? 'text-red-600' : 'text-gray-300'
         }`}>{label}</span>
   </div>
);

const InsightCard = ({ icon, text }: { icon: ReactNode; text: string }) => (
   <div className="flex items-start gap-4 text-xs font-bold leading-relaxed text-gray-400 italic">
      <div className="shrink-0">{icon}</div>
      <p>{text}</p>
   </div>
);

function getProgressWidth(status: string) {
   switch (status) {
      case 'confirmed': return '25%';
      case 'ready-for-delivery':
      case 'in-delivery':
      case 'delivered': return '55%';
      case 'active-rental':
      case 'return-scheduled': return '78%';
      case 'returned':
      case 'completed': return '100.1%';
      default: return '0%';
   }
}

function handleLogout() {
   localStorage.removeItem('carlaville_token');
   localStorage.removeItem('carlaville_user');
   window.location.href = '/';
}

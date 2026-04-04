'use client';

import {
  Check,
  X,
  Clock,
  Calendar as CalendarIcon,
  User,
  Car as CarIcon,
  MapPin,
  Mail,
  Phone,
  Banknote,
  Fuel,
  Settings,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmPayment } from '../services/reservation-service';
import { toast } from 'sonner';
import { Car, Reservation, ReservationStatus } from '@/types';

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onSuspend?: (id: string) => void;
  isActionPending?: boolean;
}

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  [ReservationStatus.PENDING]: { label: 'En attente', class: 'border-amber-200 bg-amber-50 text-amber-700', icon: Clock },
  [ReservationStatus.CONFIRMED]: { label: 'Confirmée', class: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: Check },
  [ReservationStatus.REJECTED]: { label: 'Rejetée', class: 'border-rose-200 bg-rose-50 text-rose-700', icon: X },
};

export const ReservationDetailsModal = ({
  isOpen,
  onClose,
  reservation,
  onConfirm,
  onReject,
  onSuspend,
  isActionPending,
}: ReservationDetailsModalProps) => {
  const queryClient = useQueryClient();

  const confirmPaymentMutation = useMutation({
    mutationFn: (data: { paymentMethod: string; amountCollected: number }) => 
      confirmPayment(reservation?.id || reservation?._id || '', data),
    onSuccess: () => {
      toast.success('Paiement confirmé avec succès');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
    },
    onError: () => {
      toast.error('Erreur lors de la confirmation du paiement');
    }
  });

  if (!reservation) return null;

  const rid = reservation.id || reservation._id || '';
  const status = statusConfig[reservation.status] || { label: reservation.status, class: 'bg-slate-100 text-slate-600', icon: Info };
  const car = typeof reservation.carId === 'object' ? (reservation.carId as Car) : null;

  const DetailItem = ({ icon: Icon, label, value, className }: any) => (
    <div className={cn("flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100/50", className)}>
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <Icon size={12} className="text-slate-300" />
        {label}
      </div>
      <div className="text-sm font-bold text-slate-900 truncate">{value || 'N/A'}</div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de la Réservation"
      contentClassName="max-w-4xl p-0 overflow-hidden rounded-[2.5rem]"
    >
      <div className="flex flex-col max-h-[85vh]">
        {/* Header Section */}
        <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-white/70 border border-white/5">
                RÉFÉRENCE
              </span>
              <h2 className="text-2xl font-black tracking-tight">{reservation.bookingReference}</h2>
            </div>
            <p className="text-slate-400 text-sm font-medium">Créée le {new Date(reservation.createdAt || '').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          
          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest shadow-xl",
            status.class,
            "bg-white" // Overriding the background to stand out
          )}>
            <status.icon size={16} />
            {status.label}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Main Grid: Customer & Logistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Customer Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-sm border border-red-100">
                  <User size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Client</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <DetailItem icon={User} label="Nom Complet" value={reservation.customerName} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <DetailItem icon={Mail} label="Email" value={reservation.customerEmail} />
                   <DetailItem icon={Phone} label="Téléphone" value={reservation.customerPhone} />
                </div>
              </div>
            </div>

            {/* Logistics Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-sm border border-red-100">
                  <CalendarIcon size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Période & Durée</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem icon={Clock} label="Prise en charge" value={`${new Date(reservation.pickupDate).toLocaleDateString()} à ${reservation.pickupTime}`} />
                  <DetailItem icon={Clock} label="Restitution" value={`${new Date(reservation.returnDate).toLocaleDateString()} à ${reservation.returnTime}`} />
                </div>
                <DetailItem 
                  icon={CalendarIcon} 
                  label="Durée de Location" 
                  value={`${reservation.rentalDays} Jours`} 
                  className="bg-red-50/50 border-red-100 text-red-700"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Assigned Vehicle Section (MANDATORY & PROMINENT) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
                <CarIcon size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Véhicule Assigné</h3>
            </div>
            
            <div className="bg-slate-50 rounded-[2rem] border border-slate-200 p-8 flex flex-col md:flex-row gap-8 items-center group transition-all hover:bg-white hover:shadow-2xl">
              {/* Car Basic Info */}
              <div className="flex-1 space-y-4">
                <div>
                   <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{car?.brand} {car?.model}</h4>
                   <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-red-200">
                     {car?.year}
                   </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Catégorie</span>
                      <span className="text-xs font-bold text-slate-700">{car?.category}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Transmission</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                         <Settings size={12} className="text-slate-400" />
                         {car?.transmission}
                      </div>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Carburant</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                         <Fuel size={12} className="text-slate-400" />
                         {car?.fuelType}
                      </div>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ville</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                         <MapPin size={12} className="text-slate-400" />
                         {car?.city}
                      </div>
                   </div>
                </div>
              </div>

              {/* Status & Action in card */}
              <div className="h-full border-l border-slate-200 pl-8 flex flex-col justify-center gap-4 min-w-[200px]">
                 <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matricule</span>
                    <span className="text-sm font-mono font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                       {/* Hardcoding or using car.registration if exists */}
                       {(car as any).registrationNumber || 'NON DÉFINI'}
                    </span>
                 </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Pricing & Financials */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
                <Banknote size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Finances</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <DetailItem 
                  icon={Banknote} 
                  label="Statut du Paiement" 
                  value={
                    reservation.paymentStatus === 'paid-on-delivery' ? 'Payé (Livraison)' : 
                    reservation.paymentStatus === 'unpaid' ? 'Non payé' : 
                    reservation.paymentStatus.toUpperCase()
                  } 
                  className={cn(reservation.paymentStatus === 'paid-on-delivery' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50")}
               />
               <DetailItem 
                  icon={DollarSign} 
                  label="Prix Total" 
                  value={`${reservation.pricingBreakdown?.total?.toLocaleString()} MAD`} 
                  className="bg-slate-900 text-white border-slate-800"
               />
               <DetailItem 
                  icon={Info} 
                  label="Mode de Paiement" 
                  value={reservation.paymentMethod?.toUpperCase() || 'Non défini'} 
                  className="bg-blue-50 text-blue-700 border-blue-100"
               />
            </div>

            {/* Payment Collection Action Card */}
            {reservation.paymentStatus === 'unpaid' && (
              <div className="mt-6 p-8 rounded-[2rem] border-2 border-dashed border-emerald-200 bg-emerald-50/30 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-emerald-50/50">
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-emerald-900">Encaissement au Client</h4>
                  <p className="text-emerald-700/70 text-sm font-medium">Confirmez que vous avez reçu le montant total de la part du client lors de la remise des clés.</p>
                </div>
                <Button 
                   onClick={() => confirmPaymentMutation.mutate({ 
                     paymentMethod: 'cash', 
                     amountCollected: reservation.pricingBreakdown?.total || 0 
                   })}
                   disabled={confirmPaymentMutation.isPending || isActionPending}
                   className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xl shadow-emerald-200 shrink-0"
                >
                  {confirmPaymentMutation.isPending ? 'Confirmation...' : 'Confirmer le Paiement (Cash)'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-12 px-8 rounded-xl font-bold border-none hover:bg-slate-200 transition-all"
          >
            Fermer
          </Button>

          <div className="flex items-center gap-3">
            {reservation.status === ReservationStatus.PENDING ? (
              <>
                <Button
                  onClick={() => onReject?.(rid)}
                  disabled={isActionPending}
                  variant="outline"
                  className="h-12 px-8 rounded-xl border-rose-100 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 transition-all shadow-sm shadow-rose-100/50"
                >
                  <X size={18} className="mr-2" />
                  Rejeter
                </Button>
                <Button
                  onClick={() => onConfirm?.(rid)}
                  disabled={isActionPending}
                  className="h-12 px-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-xl shadow-emerald-200 transition-all"
                >
                  <Check size={18} className="mr-2" />
                  Confirmer
                </Button>
              </>
            ) : (
                <Button
                  onClick={() => onSuspend?.(rid)}
                  disabled={isActionPending}
                  variant="outline"
                  className="h-12 px-8 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all"
                >
                  <Clock size={18} className="mr-2" />
                  Suspendre
                </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const DollarSign = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

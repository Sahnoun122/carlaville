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
  Navigation,
  Circle,
} from 'lucide-react';
import { useMemo, type ComponentType, type SVGProps } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmPayment } from '../services/reservation-service';
import { updateCarAvailabilityStatus } from '@/features/cars/services/car-service';
import { toast } from 'sonner';
import { AvailabilityStatus, Car, Reservation, ReservationStatus } from '@/types';

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onConfirm?: (id: string) => void;
  onReject?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onProgress?: (id: string, nextStatus: ReservationStatus) => void;
  isActionPending?: boolean;
}

type IconComponent = ComponentType<{ size?: number; className?: string }>;

const statusConfig: Record<string, { label: string; class: string; icon: IconComponent }> = {
  [ReservationStatus.PENDING]: { label: 'En attente', class: 'border-amber-200 bg-amber-50 text-amber-700', icon: Clock },
  [ReservationStatus.CONFIRMED]: { label: 'Confirmée', class: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: Check },
  [ReservationStatus.REJECTED]: { label: 'Rejetée', class: 'border-rose-200 bg-rose-50 text-rose-700', icon: X },
  [ReservationStatus.READY_FOR_DELIVERY]: { label: 'Prête livraison', class: 'border-sky-200 bg-sky-50 text-sky-700', icon: Navigation },
  [ReservationStatus.IN_DELIVERY]: { label: 'En route', class: 'border-indigo-200 bg-indigo-50 text-indigo-700', icon: Navigation },
  [ReservationStatus.DELIVERED]: { label: 'Arrivée', class: 'border-violet-200 bg-violet-50 text-violet-700', icon: Check },
  [ReservationStatus.ACTIVE_RENTAL]: { label: 'Client a pris la voiture', class: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: Check },
  [ReservationStatus.RETURN_SCHEDULED]: { label: 'Retour programmé', class: 'border-amber-200 bg-amber-50 text-amber-700', icon: CalendarIcon },
  [ReservationStatus.RETURNED]: { label: 'Voiture retournée', class: 'border-blue-200 bg-blue-50 text-blue-700', icon: Check },
  [ReservationStatus.COMPLETED]: { label: 'Terminée', class: 'border-slate-200 bg-slate-100 text-slate-700', icon: Check },
  [ReservationStatus.CANCELLED]: { label: 'Annulée', class: 'border-slate-200 bg-slate-100 text-slate-700', icon: X },
};

const workflowSteps: Array<{ status: ReservationStatus; label: string }> = [
  { status: ReservationStatus.PENDING, label: 'En attente' },
  { status: ReservationStatus.CONFIRMED, label: 'Confirmée' },
  { status: ReservationStatus.READY_FOR_DELIVERY, label: 'Prête livraison' },
  { status: ReservationStatus.IN_DELIVERY, label: 'En route' },
  { status: ReservationStatus.DELIVERED, label: 'Arrivée' },
  { status: ReservationStatus.ACTIVE_RENTAL, label: 'Prise véhicule' },
  { status: ReservationStatus.RETURN_SCHEDULED, label: 'Retour prévu' },
  { status: ReservationStatus.RETURNED, label: 'Retournée' },
  { status: ReservationStatus.COMPLETED, label: 'Clôturée' },
];

const manualTransitionMap: Partial<Record<ReservationStatus, ReservationStatus[]>> = {
  [ReservationStatus.PENDING]: [ReservationStatus.CONFIRMED, ReservationStatus.REJECTED],
  [ReservationStatus.CONFIRMED]: [ReservationStatus.READY_FOR_DELIVERY],
  [ReservationStatus.READY_FOR_DELIVERY]: [ReservationStatus.IN_DELIVERY],
  [ReservationStatus.IN_DELIVERY]: [ReservationStatus.DELIVERED],
  [ReservationStatus.DELIVERED]: [ReservationStatus.ACTIVE_RENTAL],
  [ReservationStatus.ACTIVE_RENTAL]: [ReservationStatus.RETURN_SCHEDULED],
  [ReservationStatus.RETURN_SCHEDULED]: [ReservationStatus.RETURNED],
  [ReservationStatus.RETURNED]: [ReservationStatus.COMPLETED],
};

const actionLabelMap: Partial<Record<ReservationStatus, string>> = {
  [ReservationStatus.CONFIRMED]: 'Confirmer',
  [ReservationStatus.REJECTED]: 'Rejeter',
  [ReservationStatus.READY_FOR_DELIVERY]: 'Marquer prête livraison',
  [ReservationStatus.IN_DELIVERY]: 'Mettre en route',
  [ReservationStatus.DELIVERED]: 'Marquer arrivée',
  [ReservationStatus.ACTIVE_RENTAL]: 'Confirmer prise véhicule',
  [ReservationStatus.RETURN_SCHEDULED]: 'Programmer retour',
  [ReservationStatus.RETURNED]: 'Marquer voiture retournée',
  [ReservationStatus.COMPLETED]: 'Clôturer réservation',
};

interface DetailItemProps {
  icon: IconComponent;
  label: string;
  value?: string | number;
  className?: string;
}

const DetailItem = ({ icon: Icon, label, value, className }: DetailItemProps) => (
  <div className={cn('flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100/50', className)}>
    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
      <Icon size={12} className="text-slate-300" />
      {label}
    </div>
    <div className="text-sm font-bold text-slate-900 truncate">{value || 'N/A'}</div>
  </div>
);

export const ReservationDetailsModal = ({
  isOpen,
  onClose,
  reservation,
  onConfirm,
  onReject,
  onSuspend,
  onProgress,
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

  const markCarAvailableMutation = useMutation({
    mutationFn: (carId: string) =>
      updateCarAvailabilityStatus(carId, AvailabilityStatus.AVAILABLE),
    onSuccess: () => {
      toast.success('Véhicule mis en disponible. Vous pouvez continuer les étapes.');
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
    onError: () => {
      toast.error('Impossible de mettre le véhicule en disponible.');
    },
  });

  const manualOptions = useMemo(() => {
    if (!reservation) return [] as ReservationStatus[];
    const transitions = manualTransitionMap[reservation.status] || [];
    return [reservation.status, ...transitions];
  }, [reservation]);

  if (!reservation) return null;

  const rid = reservation.id || reservation._id || '';
  const status = statusConfig[reservation.status] || { label: reservation.status, class: 'bg-slate-100 text-slate-600', icon: Info };
  const car = typeof reservation.carId === 'object' ? (reservation.carId as Car) : null;
  const carRegistration =
    (car as (Car & { registrationNumber?: string }) | null)?.registrationNumber ||
    'NON DÉFINI';
  const carId =
    (car as (Car & { _id?: string }) | null)?.id ||
    (car as (Car & { _id?: string }) | null)?._id ||
    '';
  const currentStepIndex = workflowSteps.findIndex((step) => step.status === reservation.status);

  const vehicleBlocked =
    car?.availabilityStatus === AvailabilityStatus.MAINTENANCE ||
    car?.availabilityStatus === AvailabilityStatus.UNAVAILABLE;

  const canCollectCash =
    reservation.paymentStatus === 'unpaid' &&
    reservation.status === ReservationStatus.DELIVERED;

  const waitingForHandoffBeforeCash =
    reservation.paymentStatus === 'unpaid' && !canCollectCash;

  const isTargetBlockedByVehicle = (targetStatus: ReservationStatus) => {
    const targetNeedsOperationalVehicle =
      targetStatus === ReservationStatus.READY_FOR_DELIVERY ||
      targetStatus === ReservationStatus.IN_DELIVERY ||
      targetStatus === ReservationStatus.DELIVERED ||
      targetStatus === ReservationStatus.ACTIVE_RENTAL;

    return vehicleBlocked && targetNeedsOperationalVehicle;
  };

  const paymentRequiredForTarget = (targetStatus: ReservationStatus) =>
    targetStatus === ReservationStatus.ACTIVE_RENTAL &&
    reservation.paymentStatus === 'unpaid';

  const availableStepActions = manualOptions.filter(
    (statusOption) => statusOption !== reservation.status,
  );

  const handleApplyStatusChange = (manualTargetStatus: ReservationStatus) => {

    if (!manualTargetStatus || manualTargetStatus === reservation.status) {
      toast.info('Choisissez un statut different avant de valider.');
      return;
    }

    if (!manualOptions.includes(manualTargetStatus)) {
      toast.error('Transition non autorisee depuis le statut actuel.');
      return;
    }

    if (isTargetBlockedByVehicle(manualTargetStatus)) {
      toast.error(`Impossible: le vehicule est en ${availabilityLabel.toLowerCase()}.`);
      return;
    }

    if (paymentRequiredForTarget(manualTargetStatus)) {
      toast.error('Confirmez d abord le paiement cash a l etape Arrivee.');
      return;
    }

    if (manualTargetStatus === ReservationStatus.CONFIRMED) {
      onConfirm?.(rid);
      return;
    }

    if (manualTargetStatus === ReservationStatus.REJECTED) {
      onReject?.(rid);
      return;
    }

    if (manualTargetStatus === ReservationStatus.PENDING) {
      onSuspend?.(rid);
      return;
    }

    onProgress?.(rid, manualTargetStatus);
  };

  const availabilityLabel =
    car?.availabilityStatus === AvailabilityStatus.AVAILABLE
      ? 'Disponible'
      : car?.availabilityStatus === AvailabilityStatus.RENTED
        ? 'Loué'
        : car?.availabilityStatus === AvailabilityStatus.MAINTENANCE
          ? 'Maintenance'
          : car?.availabilityStatus === AvailabilityStatus.UNAVAILABLE
            ? 'Indisponible'
            : 'Non défini';

  const availabilityClass =
    car?.availabilityStatus === AvailabilityStatus.AVAILABLE
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : car?.availabilityStatus === AvailabilityStatus.RENTED
        ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
        : car?.availabilityStatus === AvailabilityStatus.MAINTENANCE
          ? 'bg-amber-50 text-amber-700 border-amber-100'
          : 'bg-slate-100 text-slate-700 border-slate-200';

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
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Etat véhicule</span>
                    <span
                     className={cn(
                      'text-[11px] font-black uppercase rounded-xl border px-3 py-1.5 text-center',
                      availabilityClass,
                     )}
                    >
                     {availabilityLabel}
                    </span>
                  </div>
                 <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matricule</span>
                    <span className="text-sm font-mono font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-center">
                        {carRegistration}
                    </span>
                 </div>
              </div>
            </div>
          </div>

          {/* Workflow Tracking */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm border border-sky-100">
                <Navigation size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                Suivi des étapes
              </h3>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {workflowSteps.map((step, index) => {
                  const isCompleted = currentStepIndex >= 0 && index < currentStepIndex;
                  const isCurrent = currentStepIndex === index;

                  return (
                    <div key={step.status} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'inline-flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-black',
                          isCompleted
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : isCurrent
                              ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-slate-200 bg-slate-50 text-slate-400',
                        )}
                      >
                        {isCompleted ? <Check size={12} /> : <Circle size={12} />}
                      </span>
                      <span
                        className={cn(
                          'text-[11px] font-black uppercase tracking-wider',
                          isCurrent ? 'text-slate-900' : 'text-slate-400',
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {vehicleBlocked && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                Attention: certaines étapes livraison sont bloquées car le véhicule est en {availabilityLabel.toLowerCase()}.
              </div>
            )}

            {vehicleBlocked && carId && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm font-semibold text-indigo-800">
                    Déblocage rapide: passez le véhicule à l&apos;état disponible pour continuer le workflow.
                  </p>
                  <Button
                    onClick={() => markCarAvailableMutation.mutate(carId)}
                    disabled={isActionPending || markCarAvailableMutation.isPending}
                    className="h-10 rounded-xl bg-indigo-600 px-4 text-xs font-black uppercase tracking-wider text-white hover:bg-indigo-700"
                  >
                    {markCarAvailableMutation.isPending ? 'Mise à jour...' : 'Mettre le véhicule disponible'}
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilotage des etapes (Admin)</p>
                <p className="text-xs font-semibold text-slate-600">
                  Toutes les actions de statut sont disponibles ici dans cette popup.
                </p>
              </div>

              {availableStepActions.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
                  Aucun changement disponible pour ce statut.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {availableStepActions.map((targetStatus) => {
                    const isBlockedTarget = isTargetBlockedByVehicle(targetStatus);
                    const needsPaymentFirst = paymentRequiredForTarget(targetStatus);

                    return (
                      <Button
                        key={targetStatus}
                        onClick={() => handleApplyStatusChange(targetStatus)}
                        disabled={isActionPending || isBlockedTarget || needsPaymentFirst}
                        variant="outline"
                        className={cn(
                          'h-10 justify-start rounded-xl border-slate-200 bg-white px-3 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100',
                          targetStatus === ReservationStatus.REJECTED && 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
                          targetStatus === ReservationStatus.CONFIRMED && 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                          (isBlockedTarget || needsPaymentFirst) && 'opacity-60',
                        )}
                      >
                        {actionLabelMap[targetStatus] || statusConfig[targetStatus]?.label || targetStatus}
                      </Button>
                    );
                  })}
                </div>
              )}
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
            {waitingForHandoffBeforeCash && (
              <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">
                Encaissement cash disponible uniquement apres l&apos;etape Arrivee.
              </div>
            )}

            {canCollectCash && (
              <div className="mt-6 p-8 rounded-[2rem] border-2 border-dashed border-emerald-200 bg-emerald-50/30 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-emerald-50/50">
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-emerald-900">Encaissement au Client</h4>
                  <p className="text-emerald-700/70 text-sm font-medium">Le client est marque Arrivee. Confirmez maintenant la reception du cash de maniere officielle.</p>
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
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-start gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-12 px-8 rounded-xl font-bold border-none hover:bg-slate-200 transition-all"
          >
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const DollarSign = (props: SVGProps<SVGSVGElement>) => (
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

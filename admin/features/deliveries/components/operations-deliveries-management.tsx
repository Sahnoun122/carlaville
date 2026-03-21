'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  getOperationsDeliveries,
  updateOperationsDeliveryStatus,
} from '@/features/deliveries/services/delivery-service';
import { Delivery, DeliveryStatus } from '@/types';

const resolveDeliveryId = (delivery: Delivery) =>
  delivery.id || delivery._id || '';

const resolveReservationLabel = (delivery: Delivery) => {
  if (delivery.reservationId && typeof delivery.reservationId === 'object') {
    return `${delivery.reservationId.bookingReference ?? ''} • ${delivery.reservationId.customerName ?? ''}`.trim();
  }

  return 'N/A';
};

const nextStatuses: DeliveryStatus[] = [
  DeliveryStatus.ON_THE_WAY,
  DeliveryStatus.ARRIVED,
  DeliveryStatus.CONFIRMED,
  DeliveryStatus.FAILED,
];

export const OperationsDeliveriesManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all');
  const [actionError, setActionError] = useState<string | null>(null);

  const deliveriesQuery = useQuery({
    queryKey: ['operations-deliveries', page, statusFilter],
    queryFn: () =>
      getOperationsDeliveries({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: updateOperationsDeliveryStatus,
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['operations-deliveries'] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Échec de la mise à jour du statut de livraison.';

      setActionError(message);
    },
  });

  const handleQuickStatus = (deliveryId: string, status: DeliveryStatus) => {
    updateMutation.mutate({ id: deliveryId, status });
  };

  const handleStatusWithNotes = (
    event: FormEvent<HTMLFormElement>,
    deliveryId: string,
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const status = String(formData.get('status') || '') as DeliveryStatus;
    const notes = String(formData.get('notes') || '');
    const gpsLocation = String(formData.get('gpsLocation') || '');

    if (!status) {
      return;
    }

    updateMutation.mutate({
      id: deliveryId,
      status,
      notes: notes.trim() || undefined,
      gpsLocation: gpsLocation.trim() || undefined,
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Mes Livraisons</h2>
      {actionError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{actionError}</p>}

      <div>
        <label className="block mb-1 text-sm font-medium text-slate-700">Filtre de Statut</label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | DeliveryStatus)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 md:w-64"
        >
          <option value="all">tous</option>
          {Object.values(DeliveryStatus).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {deliveriesQuery.isLoading && <p className="text-sm text-slate-600">Chargement de vos livraisons...</p>}
      {deliveriesQuery.isError && <p className="text-sm text-rose-600">Erreur lors du chargement des livraisons.</p>}

      {deliveriesQuery.data && (
        <div className="space-y-3">
          {deliveriesQuery.data.deliveries.map((delivery) => {
            const deliveryId = resolveDeliveryId(delivery);
            return (
              <div key={deliveryId} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-800">{resolveReservationLabel(delivery)}</p>
                    <p className="text-xs text-slate-500">
                      {delivery.type} • {new Date(delivery.scheduledDate).toLocaleDateString()} {delivery.scheduledTime}
                    </p>
                  </div>
                  <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{delivery.status}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickStatus(deliveryId, status)}
                      disabled={updateMutation.isPending}
                    >
                      {status}
                    </Button>
                  ))}
                </div>

                <form
                  onSubmit={(event) => handleStatusWithNotes(event, deliveryId)}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2"
                >
                  <select name="status" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200">
                    {Object.values(DeliveryStatus).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <input
                    name="gpsLocation"
                    placeholder="Localisation GPS"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                  <input
                    name="notes"
                    placeholder="Note"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                  <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                    Mettre à jour
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

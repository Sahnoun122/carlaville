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
          : 'Failed to update delivery status.';

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
    <div className="rounded-md border bg-white p-4 space-y-3">
      <h2 className="text-lg font-semibold">My Deliveries</h2>
      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      <div>
        <label className="block mb-1 text-sm font-medium">Status Filter</label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | DeliveryStatus)}
          className="w-full md:w-64 px-3 py-2 border rounded"
        >
          <option value="all">all</option>
          {Object.values(DeliveryStatus).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {deliveriesQuery.isLoading && <p>Loading your deliveries...</p>}
      {deliveriesQuery.isError && <p>Error loading deliveries.</p>}

      {deliveriesQuery.data && (
        <div className="space-y-3">
          {deliveriesQuery.data.deliveries.map((delivery) => {
            const deliveryId = resolveDeliveryId(delivery);
            return (
              <div key={deliveryId} className="border rounded p-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{resolveReservationLabel(delivery)}</p>
                    <p className="text-xs text-gray-500">
                      {delivery.type} • {new Date(delivery.scheduledDate).toLocaleDateString()} {delivery.scheduledTime}
                    </p>
                  </div>
                  <span className="text-sm">{delivery.status}</span>
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
                  <select name="status" className="px-3 py-2 border rounded">
                    {Object.values(DeliveryStatus).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <input
                    name="gpsLocation"
                    placeholder="GPS location"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    name="notes"
                    placeholder="Note"
                    className="px-3 py-2 border rounded"
                  />
                  <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                    Update
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

'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  createDelivery,
  getAdminDeliveries,
  getDeliveryAgentsForSelect,
  getReservationsForDeliverySelect,
} from '@/features/deliveries/services/delivery-service';
import { Delivery, DeliveryStatus, DeliveryType } from '@/types';

const resolveDeliveryId = (delivery: Delivery) =>
  delivery.id || delivery._id || '';

const resolveReservationLabel = (delivery: Delivery) => {
  if (delivery.reservationId && typeof delivery.reservationId === 'object') {
    return `${delivery.reservationId.bookingReference ?? ''} • ${delivery.reservationId.customerName ?? ''}`.trim();
  }

  return 'N/A';
};

const resolveAgentLabel = (delivery: Delivery) => {
  if (delivery.assignedAgentId && typeof delivery.assignedAgentId === 'object') {
    return delivery.assignedAgentId.name || delivery.assignedAgentId.email || 'Agent';
  }

  return 'N/A';
};

export const AdminDeliveriesManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | DeliveryType>('all');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const deliveriesQuery = useQuery({
    queryKey: ['admin-deliveries', page, statusFilter, typeFilter],
    queryFn: () =>
      getAdminDeliveries({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
      }),
  });

  const reservationsQuery = useQuery({
    queryKey: ['delivery-reservations-select'],
    queryFn: getReservationsForDeliverySelect,
  });

  const agentsQuery = useQuery({
    queryKey: ['delivery-agents-select'],
    queryFn: getDeliveryAgentsForSelect,
  });

  const createMutation = useMutation({
    mutationFn: createDelivery,
    onSuccess: () => {
      setSubmitError(null);
      setSubmitSuccess('Delivery created and assigned successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-deliveries'] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to create delivery.';

      setSubmitSuccess(null);
      setSubmitError(message);
    },
  });

  const isLoadingOptions = reservationsQuery.isLoading || agentsQuery.isLoading;

  const statusOptions = useMemo(
    () => ['all', ...Object.values(DeliveryStatus)] as const,
    [],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const formData = new FormData(event.currentTarget);
    const reservationId = String(formData.get('reservationId') || '');
    const assignedAgentId = String(formData.get('assignedAgentId') || '');
    const type = String(formData.get('type') || '') as DeliveryType;
    const scheduledDate = String(formData.get('scheduledDate') || '');
    const scheduledTime = String(formData.get('scheduledTime') || '');
    const notes = String(formData.get('notes') || '');

    if (!reservationId || !assignedAgentId || !type || !scheduledDate || !scheduledTime) {
      setSubmitError('All required fields must be filled.');
      return;
    }

    createMutation.mutate({
      reservationId,
      assignedAgentId,
      type,
      scheduledDate,
      scheduledTime,
      notes: notes.trim() || undefined,
    });

    event.currentTarget.reset();
  };

  return (
    <div className="space-y-4">
      <form className="rounded-md border bg-white p-4 space-y-3" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold">Create Delivery Assignment</h2>
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        {submitSuccess && <p className="text-sm text-green-600">{submitSuccess}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Reservation</label>
            <select
              name="reservationId"
              className="w-full px-3 py-2 border rounded"
              disabled={isLoadingOptions}
              defaultValue=""
            >
              <option value="" disabled>Select reservation</option>
              {(reservationsQuery.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Delivery Agent</label>
            <select
              name="assignedAgentId"
              className="w-full px-3 py-2 border rounded"
              disabled={isLoadingOptions}
              defaultValue=""
            >
              <option value="" disabled>Select delivery agent</option>
              {(agentsQuery.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Type</label>
            <select name="type" className="w-full px-3 py-2 border rounded" defaultValue={DeliveryType.PICKUP}>
              <option value={DeliveryType.PICKUP}>pickup</option>
              <option value={DeliveryType.RETURN}>return</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Scheduled Date</label>
            <input name="scheduledDate" type="date" className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Scheduled Time</label>
            <input name="scheduledTime" type="time" className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Notes</label>
            <input name="notes" type="text" className="w-full px-3 py-2 border rounded" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={createMutation.isPending}>Create Delivery</Button>
        </div>
      </form>

      <div className="rounded-md border bg-white p-4 space-y-3">
        <h2 className="text-lg font-semibold">Delivery List</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | DeliveryStatus)}
              className="w-full px-3 py-2 border rounded"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Type</label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as 'all' | DeliveryType)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="all">all</option>
              <option value={DeliveryType.PICKUP}>pickup</option>
              <option value={DeliveryType.RETURN}>return</option>
            </select>
          </div>
        </div>

        {deliveriesQuery.isLoading && <p>Loading deliveries...</p>}
        {deliveriesQuery.isError && <p>Error loading deliveries.</p>}

        {deliveriesQuery.data && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-2">Reservation</th>
                  <th className="px-3 py-2">Agent</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Schedule</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveriesQuery.data.deliveries.map((delivery) => (
                  <tr key={resolveDeliveryId(delivery)} className="border-t">
                    <td className="px-3 py-2">{resolveReservationLabel(delivery)}</td>
                    <td className="px-3 py-2">{resolveAgentLabel(delivery)}</td>
                    <td className="px-3 py-2">{delivery.type}</td>
                    <td className="px-3 py-2">
                      {new Date(delivery.scheduledDate).toLocaleDateString()} {delivery.scheduledTime}
                    </td>
                    <td className="px-3 py-2">{delivery.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

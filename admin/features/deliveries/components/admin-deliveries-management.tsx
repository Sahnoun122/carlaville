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
    <div className="space-y-5">
      <form className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold text-slate-800">Create Delivery Assignment</h2>
        {submitError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>}
        {submitSuccess && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{submitSuccess}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Reservation</label>
            <select
              name="reservationId"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
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
            <label className="block mb-1 text-sm font-medium text-slate-700">Delivery Agent</label>
            <select
              name="assignedAgentId"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
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
            <label className="block mb-1 text-sm font-medium text-slate-700">Type</label>
            <select name="type" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200" defaultValue={DeliveryType.PICKUP}>
              <option value={DeliveryType.PICKUP}>pickup</option>
              <option value={DeliveryType.RETURN}>return</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Scheduled Date</label>
            <input name="scheduledDate" type="date" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Scheduled Time</label>
            <input name="scheduledTime" type="time" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200" />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Notes</label>
            <input name="notes" type="text" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={createMutation.isPending}>Create Delivery</Button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Delivery List</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | DeliveryStatus)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Type</label>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as 'all' | DeliveryType)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              <option value="all">all</option>
              <option value={DeliveryType.PICKUP}>pickup</option>
              <option value={DeliveryType.RETURN}>return</option>
            </select>
          </div>
        </div>

        {deliveriesQuery.isLoading && <p className="text-sm text-slate-600">Loading deliveries...</p>}
        {deliveriesQuery.isError && <p className="text-sm text-rose-600">Error loading deliveries.</p>}

        {deliveriesQuery.data && (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-medium">Reservation</th>
                  <th className="px-3 py-2 font-medium">Agent</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Schedule</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveriesQuery.data.deliveries.map((delivery) => (
                  <tr key={resolveDeliveryId(delivery)} className="border-t border-slate-200 text-slate-700 hover:bg-slate-50/60">
                    <td className="px-3 py-2">{resolveReservationLabel(delivery)}</td>
                    <td className="px-3 py-2">{resolveAgentLabel(delivery)}</td>
                    <td className="px-3 py-2 uppercase">{delivery.type}</td>
                    <td className="px-3 py-2">
                      {new Date(delivery.scheduledDate).toLocaleDateString()} {delivery.scheduledTime}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {delivery.status}
                      </span>
                    </td>
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

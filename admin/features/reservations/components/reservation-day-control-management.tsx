'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  getReservationDayControlSettings,
  updateReservationDayControlSettings,
} from '@/features/reservations/services/reservation-settings-service';

const weekdayOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const ReservationDayControlManagement = () => {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['reservation-day-control-settings'],
    queryFn: getReservationDayControlSettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateReservationDayControlSettings,
    onSuccess: () => {
      setSubmitError(null);
      setSubmitSuccess('Reservation day policy updated successfully.');
      queryClient.invalidateQueries({
        queryKey: ['reservation-day-control-settings'],
      });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to update reservation day policy.';

      setSubmitSuccess(null);
      setSubmitError(message);
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!settingsQuery.data) {
      return;
    }

    setSubmitSuccess(null);
    setSubmitError(null);

    const formData = new FormData(event.currentTarget);
    const minRentalDays = Number(formData.get('minRentalDays'));
    const maxRentalDays = Number(formData.get('maxRentalDays'));
    const maxAdvanceBookingDays = Number(formData.get('maxAdvanceBookingDays'));
    const allowSameDayBooking = formData.get('allowSameDayBooking') === 'on';
    const blockedWeekdays = formData
      .getAll('blockedWeekdays')
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
      .sort((a, b) => a - b);

    if (minRentalDays > maxRentalDays) {
      setSubmitError('Minimum rental days cannot be greater than maximum rental days.');
      return;
    }

    updateMutation.mutate({
      minRentalDays,
      maxRentalDays,
      maxAdvanceBookingDays,
      allowSameDayBooking,
      blockedWeekdays,
    });
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">General Reservation Day Control</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define global booking policy used as fallback when a vehicle policy is not set.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-600">
        Define global rules for vehicle reservation duration and allowed booking days.
      </p>

      {submitError && <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>}
      {submitSuccess && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{submitSuccess}</p>}

      {settingsQuery.isLoading && <p className="mt-4 text-sm text-slate-600">Loading reservation settings...</p>}
      {settingsQuery.isError && !submitError && (
        <p className="mt-4 text-sm text-rose-600">Failed to load reservation settings.</p>
      )}

      {!settingsQuery.isLoading && settingsQuery.data && (
        <form
          key={settingsQuery.data.id}
          className="mt-5 space-y-5"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Minimum Rental Days</label>
              <input
                name="minRentalDays"
                type="number"
                min={1}
                defaultValue={settingsQuery.data.minRentalDays}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Maximum Rental Days</label>
              <input
                name="maxRentalDays"
                type="number"
                min={1}
                defaultValue={settingsQuery.data.maxRentalDays}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Max Advance Booking (days)</label>
              <input
                name="maxAdvanceBookingDays"
                type="number"
                min={0}
                defaultValue={settingsQuery.data.maxAdvanceBookingDays}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              name="allowSameDayBooking"
              id="allowSameDayBooking"
              type="checkbox"
              defaultChecked={settingsQuery.data.allowSameDayBooking}
            />
            <label htmlFor="allowSameDayBooking" className="text-sm font-medium text-slate-700">
              Allow same-day booking
            </label>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Blocked weekdays</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {weekdayOptions.map((day) => (
                <label key={day.value} className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 text-sm text-slate-700">
                  <input
                    name="blockedWeekdays"
                    value={day.value}
                    type="checkbox"
                    defaultChecked={settingsQuery.data.blockedWeekdays.includes(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="shadow-sm" type="submit" disabled={updateMutation.isPending}>
              Save Reservation Policy
            </Button>
          </div>
        </form>
      )}
      </div>
    </div>
  );
};

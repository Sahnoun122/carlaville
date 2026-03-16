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
    <div className="max-w-3xl rounded-md border bg-white p-6 space-y-4">
      <h2 className="text-lg font-semibold">General Reservation Day Control</h2>
      <p className="text-sm text-gray-600">
        Define global rules for vehicle reservation duration and allowed booking days.
      </p>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      {submitSuccess && <p className="text-sm text-green-600">{submitSuccess}</p>}

      {settingsQuery.isLoading && <p>Loading reservation settings...</p>}
      {settingsQuery.isError && !submitError && (
        <p className="text-sm text-red-600">Failed to load reservation settings.</p>
      )}

      {!settingsQuery.isLoading && settingsQuery.data && (
        <form
          key={settingsQuery.data.id}
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-sm font-medium">Minimum Rental Days</label>
              <input
                name="minRentalDays"
                type="number"
                min={1}
                defaultValue={settingsQuery.data.minRentalDays}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Maximum Rental Days</label>
              <input
                name="maxRentalDays"
                type="number"
                min={1}
                defaultValue={settingsQuery.data.maxRentalDays}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Max Advance Booking (days)</label>
              <input
                name="maxAdvanceBookingDays"
                type="number"
                min={0}
                defaultValue={settingsQuery.data.maxAdvanceBookingDays}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              name="allowSameDayBooking"
              id="allowSameDayBooking"
              type="checkbox"
              defaultChecked={settingsQuery.data.allowSameDayBooking}
            />
            <label htmlFor="allowSameDayBooking" className="text-sm font-medium">
              Allow same-day booking
            </label>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Blocked weekdays</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {weekdayOptions.map((day) => (
                <label key={day.value} className="flex items-center gap-2 text-sm">
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
            <Button type="submit" disabled={updateMutation.isPending}>
              Save Reservation Policy
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

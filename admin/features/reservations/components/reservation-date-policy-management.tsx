'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  getReservationDayControlSettings,
  updateReservationDayControlSettings,
} from '@/features/reservations/services/reservation-settings-service';

const weekdayOptions = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
];

export const ReservationDatePolicyManagement = () => {
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
      setSubmitSuccess('Politique de dates mise à jour avec succès.');
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
          : 'Échec de mise à jour des règles de dates.';

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
      setSubmitError('Le minimum de jours ne peut pas dépasser le maximum.');
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
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold text-slate-800">Règles de dates de réservation</h2>
        <p className="mt-1 text-sm text-slate-500">
          Gérez la durée minimale/maximale, la réservation le jour même et les jours bloqués.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        {submitError && <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>}
        {submitSuccess && <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{submitSuccess}</p>}

        {settingsQuery.isLoading && <p className="text-sm text-slate-600">Chargement des paramètres...</p>}
        {settingsQuery.isError && !submitError && (
          <p className="text-sm text-rose-600">Impossible de charger les paramètres.</p>
        )}

        {!settingsQuery.isLoading && settingsQuery.data && (
          <form key={settingsQuery.data.id} className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Minimum de jours</label>
                <input
                  name="minRentalDays"
                  type="number"
                  min={1}
                  defaultValue={settingsQuery.data.minRentalDays}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Maximum de jours</label>
                <input
                  name="maxRentalDays"
                  type="number"
                  min={1}
                  defaultValue={settingsQuery.data.maxRentalDays}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Réservation à l’avance (jours)</label>
                <input
                  name="maxAdvanceBookingDays"
                  type="number"
                  min={0}
                  defaultValue={settingsQuery.data.maxAdvanceBookingDays}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <input
                name="allowSameDayBooking"
                id="allowSameDayBooking"
                type="checkbox"
                defaultChecked={settingsQuery.data.allowSameDayBooking}
              />
              <label htmlFor="allowSameDayBooking" className="text-sm font-medium text-slate-700">
                Autoriser la réservation le jour même
              </label>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Jours bloqués</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

            <div className="flex justify-start sm:justify-end">
              <Button className="shadow-sm" type="submit" disabled={updateMutation.isPending}>
                Enregistrer les règles de dates
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

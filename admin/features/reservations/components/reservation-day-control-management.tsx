'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { getCars } from '@/features/cars/services/car-service';
import {
  getReservationDayControlSettings,
  updateReservationDayControlSettings,
} from '@/features/reservations/services/reservation-settings-service';
import type { ReservationExtraOption } from '@/types';

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
  const [extrasDraft, setExtrasDraft] = useState<ReservationExtraOption[]>([]);

  const settingsQuery = useQuery({
    queryKey: ['reservation-day-control-settings'],
    queryFn: getReservationDayControlSettings,
  });

  const carsQuery = useQuery({
    queryKey: ['cars', 'reservation-settings-extras'],
    queryFn: () => getCars({ page: 1, limit: 200 }),
  });

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    setExtrasDraft(
      (settingsQuery.data.extras || []).map((extra) => ({
        ...extra,
        carIds: extra.carIds || [],
      })),
    );
  }, [settingsQuery.data]);

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

    const normalizedExtras = extrasDraft
      .map((extra) => {
        const normalizedId = extra.id.trim().toLowerCase().replace(/\s+/g, '_');
        const normalizedLabel = extra.label.trim();
        const normalizedCarIds = Array.from(new Set((extra.carIds || []).filter(Boolean)));

        return {
          ...extra,
          id: normalizedId,
          label: normalizedLabel,
          price: Number(extra.price) || 0,
          carIds: normalizedCarIds,
          active: extra.active ?? true,
        };
      })
      .filter((extra) => extra.id.length > 0 && extra.label.length > 0);

    if (minRentalDays > maxRentalDays) {
      setSubmitError('Minimum rental days cannot be greater than maximum rental days.');
      return;
    }

    const duplicateExtraId = normalizedExtras.find(
      (extra, index) =>
        normalizedExtras.findIndex((candidate) => candidate.id === extra.id) !== index,
    );

    if (duplicateExtraId) {
      setSubmitError(`Duplicate extra id: ${duplicateExtraId.id}`);
      return;
    }

    const missingScopedCars = normalizedExtras.find(
      (extra) => extra.scope === 'SELECTED_CARS' && extra.carIds.length === 0,
    );

    if (missingScopedCars) {
      setSubmitError(`Please select at least one car for "${missingScopedCars.label}".`);
      return;
    }

    updateMutation.mutate({
      minRentalDays,
      maxRentalDays,
      maxAdvanceBookingDays,
      allowSameDayBooking,
      blockedWeekdays,
      extras: normalizedExtras,
    });
  };

  const carOptions = useMemo(
    () =>
      (carsQuery.data?.cars || []).map((car) => ({
        id: car.id || (car as { _id?: string })._id || '',
        label: `${car.brand} ${car.model} (${car.city})`,
      })),
    [carsQuery.data?.cars],
  );

  const addExtra = () => {
    setExtrasDraft((previous) => [
      ...previous,
      {
        id: '',
        label: '',
        price: 0,
        billingType: 'PER_DAY',
        scope: 'ALL_CARS',
        carIds: [],
        active: true,
      },
    ]);
  };

  const removeExtra = (index: number) => {
    setExtrasDraft((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateExtra = <K extends keyof ReservationExtraOption>(
    index: number,
    key: K,
    value: ReservationExtraOption[K],
  ) => {
    setExtrasDraft((previous) =>
      previous.map((extra, itemIndex) =>
        itemIndex === index
          ? {
              ...extra,
              [key]: value,
              ...(key === 'scope' && value === 'ALL_CARS' ? { carIds: [] } : {}),
            }
          : extra,
      ),
    );
  };

  const toggleCarForExtra = (index: number, carId: string) => {
    setExtrasDraft((previous) =>
      previous.map((extra, itemIndex) => {
        if (itemIndex !== index) {
          return extra;
        }

        const exists = (extra.carIds || []).includes(carId);
        return {
          ...extra,
          carIds: exists
            ? (extra.carIds || []).filter((id) => id !== carId)
            : [...(extra.carIds || []), carId],
        };
      }),
    );
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

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Options & Extras</p>
                <p className="text-xs text-slate-500">
                  Configure selectable extras and target all vehicles or specific ones.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addExtra}>
                Add Extra
              </Button>
            </div>

            {extrasDraft.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                No extras configured yet.
              </div>
            ) : (
              <div className="space-y-4">
                {extrasDraft.map((extra, index) => (
                  <div key={`${extra.id || 'new'}-${index}`} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">ID technique</label>
                        <input
                          value={extra.id}
                          onChange={(event) => updateExtra(index, 'id', event.target.value)}
                          placeholder="ex: baby_seat"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Libellé</label>
                        <input
                          value={extra.label}
                          onChange={(event) => updateExtra(index, 'label', event.target.value)}
                          placeholder="ex: Siège bébé"
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Prix (MAD)</label>
                        <input
                          type="number"
                          min={0}
                          value={extra.price}
                          onChange={(event) => updateExtra(index, 'price', Number(event.target.value))}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                      </div>
                      <div className="flex items-end justify-between gap-2">
                        <div className="w-full">
                          <label className="mb-1 block text-xs font-medium text-slate-600">Facturation</label>
                          <select
                            value={extra.billingType}
                            onChange={(event) =>
                              updateExtra(index, 'billingType', event.target.value as ReservationExtraOption['billingType'])
                            }
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                          >
                            <option value="PER_DAY">Par jour</option>
                            <option value="PER_RENTAL">Par location</option>
                          </select>
                        </div>
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeExtra(index)}>
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Portée</label>
                        <select
                          value={extra.scope}
                          onChange={(event) =>
                            updateExtra(index, 'scope', event.target.value as ReservationExtraOption['scope'])
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                        >
                          <option value="ALL_CARS">Toutes les voitures</option>
                          <option value="SELECTED_CARS">Voitures spécifiques</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={extra.active}
                            onChange={(event) => updateExtra(index, 'active', event.target.checked)}
                          />
                          Option active
                        </label>
                      </div>
                    </div>

                    {extra.scope === 'SELECTED_CARS' && (
                      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                        <p className="mb-2 text-xs font-medium text-slate-700">Voitures concernées</p>
                        {carsQuery.isLoading ? (
                          <p className="text-xs text-slate-500">Loading vehicles...</p>
                        ) : carOptions.length === 0 ? (
                          <p className="text-xs text-slate-500">No vehicles available.</p>
                        ) : (
                          <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
                            {carOptions.map((car) => (
                              <label key={car.id} className="flex items-center gap-2 text-xs text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={(extra.carIds || []).includes(car.id)}
                                  onChange={() => toggleCarForExtra(index, car.id)}
                                />
                                {car.label}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

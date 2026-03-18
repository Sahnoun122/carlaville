'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getCars } from '@/features/cars/services/car-service';
import {
  getReservationDayControlSettings,
  updateReservationDayControlSettings,
} from '@/features/reservations/services/reservation-settings-service';
import type { ReservationExtraOption } from '@/types';

interface ExtraFormState {
  id: string;
  label: string;
  price: number;
  billingType: ReservationExtraOption['billingType'];
  scope: ReservationExtraOption['scope'];
  carIds: string[];
  active: boolean;
}

const createDefaultFormState = (): ExtraFormState => ({
  id: '',
  label: '',
  price: 0,
  billingType: 'PER_DAY',
  scope: 'ALL_CARS',
  carIds: [],
  active: true,
});

const toFormState = (extra: ReservationExtraOption): ExtraFormState => ({
  id: extra.id,
  label: extra.label,
  price: extra.price,
  billingType: extra.billingType,
  scope: extra.scope,
  carIds: extra.carIds || [],
  active: extra.active,
});

const normalizeExtra = (extra: ReservationExtraOption): ReservationExtraOption => ({
  ...extra,
  id: extra.id.trim().toLowerCase().replace(/\s+/g, '_'),
  label: extra.label.trim(),
  price: Number(extra.price) || 0,
  carIds: extra.scope === 'ALL_CARS' ? [] : Array.from(new Set((extra.carIds || []).filter(Boolean))),
  active: extra.active ?? true,
});

const validateExtras = (extras: ReservationExtraOption[]): string | null => {
  const duplicateExtraId = extras.find(
    (extra, index) => extras.findIndex((candidate) => candidate.id === extra.id) !== index,
  );

  if (duplicateExtraId) {
    return `Identifiant dupliqué: ${duplicateExtraId.id}`;
  }

  const missingScopedCars = extras.find(
    (extra) => extra.scope === 'SELECTED_CARS' && (extra.carIds || []).length === 0,
  );

  if (missingScopedCars) {
    return `Sélectionnez au moins une voiture pour "${missingScopedCars.label}".`;
  }

  return null;
};

export const ReservationExtrasManagement = () => {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [extrasDraft, setExtrasDraft] = useState<ReservationExtraOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [extraForm, setExtraForm] = useState<ExtraFormState>(createDefaultFormState());

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
      setSubmitSuccess('Options & extras mis à jour avec succès.');
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
          : 'Échec de mise à jour des options & extras.';

      setSubmitSuccess(null);
      setSubmitError(message);
    },
  });

  const carOptions = useMemo(
    () =>
      (carsQuery.data?.cars || []).map((car) => ({
        id: car.id || (car as { _id?: string })._id || '',
        label: `${car.brand} ${car.model} (${car.city})`,
      })),
    [carsQuery.data?.cars],
  );

  const persistExtras = (
    nextExtras: ReservationExtraOption[],
    successMessage: string,
  ) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    const normalizedExtras = nextExtras
      .map(normalizeExtra)
      .filter((extra) => extra.id.length > 0 && extra.label.length > 0);

    const validationError = validateExtras(normalizedExtras);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    updateMutation.mutate(
      { extras: normalizedExtras },
      {
        onSuccess: () => {
          setExtrasDraft(normalizedExtras);
          setSubmitSuccess(successMessage);
          setSubmitError(null);
          queryClient.invalidateQueries({
            queryKey: ['reservation-day-control-settings'],
          });
        },
      },
    );
  };

  const handleOpenCreate = () => {
    setEditingIndex(null);
    setExtraForm(createDefaultFormState());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    setExtraForm(toFormState(extrasDraft[index]));
    setIsModalOpen(true);
  };

  const toggleCarInForm = (carId: string) => {
    setExtraForm((previous) => {
      const exists = previous.carIds.includes(carId);
      return {
        ...previous,
        carIds: exists
          ? previous.carIds.filter((id) => id !== carId)
          : [...previous.carIds, carId],
      };
    });
  };

  const handleSubmitModal = () => {
    const candidate: ReservationExtraOption = normalizeExtra({
      ...extraForm,
      active: extraForm.active,
    });

    if (!candidate.id || !candidate.label) {
      setSubmitError('ID technique et libellé sont obligatoires.');
      return;
    }

    const nextExtras = [...extrasDraft];
    if (editingIndex === null) {
      nextExtras.push(candidate);
      persistExtras(nextExtras, 'Extra ajouté avec succès.');
    } else {
      nextExtras[editingIndex] = candidate;
      persistExtras(nextExtras, 'Extra modifié avec succès.');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (index: number) => {
    const nextExtras = extrasDraft.filter((_, itemIndex) => itemIndex !== index);
    persistExtras(nextExtras, 'Extra supprimé avec succès.');
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Options & Extras</h2>
        <p className="mt-1 text-sm text-slate-500">
          Gérez les choix additionnels et leur tarification, sur toutes les voitures ou des voitures ciblées.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        {submitError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>}
        {submitSuccess && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{submitSuccess}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Catalogue des extras</p>
            <p className="text-xs text-slate-500">Le calcul est appliqué automatiquement lors de la réservation.</p>
          </div>
          <Button type="button" variant="outline" onClick={handleOpenCreate}>Ajouter un extra</Button>
        </div>

        {settingsQuery.isLoading ? (
          <p className="text-sm text-slate-600">Chargement des extras...</p>
        ) : extrasDraft.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            Aucun extra configuré.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Extra</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Facturation</TableHead>
                <TableHead>Portée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extrasDraft.map((extra, index) => (
                <TableRow key={`${extra.id}-${index}`}>
                  <TableCell>
                    <div className="font-semibold text-slate-800">{extra.label}</div>
                    <div className="text-xs text-slate-500">{extra.id}</div>
                  </TableCell>
                  <TableCell>{extra.price} MAD</TableCell>
                  <TableCell>{extra.billingType === 'PER_DAY' ? 'Par jour' : 'Par location'}</TableCell>
                  <TableCell>{extra.scope === 'ALL_CARS' ? 'Toutes voitures' : `${(extra.carIds || []).length} voiture(s)`}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${extra.active ? 'border border-emerald-200 bg-emerald-100 text-emerald-700' : 'border border-slate-200 bg-slate-100 text-slate-600'}`}>
                      {extra.active ? 'Actif' : 'Inactif'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEdit(index)}>
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(index)}
                        disabled={updateMutation.isPending}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex === null ? 'Ajouter un extra' : 'Modifier un extra'}
        contentClassName="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">ID technique</label>
              <input
                value={extraForm.id}
                onChange={(event) => setExtraForm((previous) => ({ ...previous, id: event.target.value }))}
                placeholder="ex: baby_seat"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Libellé</label>
              <input
                value={extraForm.label}
                onChange={(event) => setExtraForm((previous) => ({ ...previous, label: event.target.value }))}
                placeholder="ex: Siège bébé"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Prix (MAD)</label>
              <input
                type="number"
                min={0}
                value={extraForm.price}
                onChange={(event) => setExtraForm((previous) => ({ ...previous, price: Number(event.target.value) }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Facturation</label>
              <select
                value={extraForm.billingType}
                onChange={(event) =>
                  setExtraForm((previous) => ({
                    ...previous,
                    billingType: event.target.value as ReservationExtraOption['billingType'],
                  }))
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="PER_DAY">Par jour</option>
                <option value="PER_RENTAL">Par location</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Portée</label>
              <select
                value={extraForm.scope}
                onChange={(event) =>
                  setExtraForm((previous) => ({
                    ...previous,
                    scope: event.target.value as ReservationExtraOption['scope'],
                    carIds: event.target.value === 'ALL_CARS' ? [] : previous.carIds,
                  }))
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
                  checked={extraForm.active}
                  onChange={(event) => setExtraForm((previous) => ({ ...previous, active: event.target.checked }))}
                />
                Option active
              </label>
            </div>
          </div>

          {extraForm.scope === 'SELECTED_CARS' && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-medium text-slate-700">Voitures concernées</p>
              {carsQuery.isLoading ? (
                <p className="text-xs text-slate-500">Chargement des voitures...</p>
              ) : carOptions.length === 0 ? (
                <p className="text-xs text-slate-500">Aucune voiture disponible.</p>
              ) : (
                <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
                  {carOptions.map((car) => (
                    <label key={car.id} className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={extraForm.carIds.includes(car.id)}
                        onChange={() => toggleCarInForm(car.id)}
                      />
                      {car.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitModal} disabled={updateMutation.isPending}>
              {editingIndex === null ? 'Ajouter' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

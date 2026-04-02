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
    persistExtras(nextExtras, 'Extra supprimé avec succ�  const labelClass = "text-sm font-semibold text-[#1E293B] mb-2";
  const inputClass = "h-12 bg-[#F8F9FA] border border-[#EDEFF2] rounded-[10px] px-4 font-medium transition-all focus:bg-white focus:border-blue-500 focus:ring-0 outline-none text-slate-800 placeholder:text-slate-400 text-base";

  return (
    <div className="max-w-5xl space-y-8 text-left pb-20">
      <div className="bg-white p-10 rounded-[24px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#1E293B]">Options & Extras</h2>
          <p className="text-slate-400 text-sm italic">
            Gérez les choix additionnels et leur tarification, sur toutes les voitures ou des voitures ciblées.
          </p>
        </div>
        <Button type="button" onClick={handleOpenCreate} className="h-12 bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          Ajouter un extra
        </Button>
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-8 shadow-sm space-y-6">
        {submitError && <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600 font-medium">{submitError}</p>}
        {submitSuccess && <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 font-medium">{submitSuccess}</p>}

        {settingsQuery.isLoading ? (
          <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : extrasDraft.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-400 font-medium">
            Aucun extra configuré.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Extra</TableHead>
                  <TableHead className="font-bold text-slate-700">Prix</TableHead>
                  <TableHead className="font-bold text-slate-700">Facturation</TableHead>
                  <TableHead className="font-bold text-slate-700">Portée</TableHead>
                  <TableHead className="font-bold text-slate-700">Statut</TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extrasDraft.map((extra, index) => (
                  <TableRow key={`${extra.id}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="font-bold text-slate-800">{extra.label}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{extra.id}</div>
                    </TableCell>
                    <TableCell className="font-bold text-blue-600">{extra.price} MAD</TableCell>
                    <TableCell className="text-slate-600 font-medium">{extra.billingType === 'PER_DAY' ? 'Par jour' : 'Par location'}</TableCell>
                    <TableCell className="text-slate-600 font-medium">{extra.scope === 'ALL_CARS' ? 'Toutes voitures' : `${(extra.carIds || []).length} voiture(s)`}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tight", extra.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200')}>
                        {extra.active ? 'Actif' : 'Inactif'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(index)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Settings2 size={16} /></button>
                        <button onClick={() => handleDelete(index)} disabled={updateMutation.isPending} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingIndex === null ? 'Ajouter un extra' : 'Modifier un extra'} contentClassName="max-w-3xl p-0 overflow-hidden rounded-[20px] shadow-2xl">
        <div className="flex flex-col bg-white text-left">
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass}>ID technique</label>
                <input value={extraForm.id} onChange={(e) => setExtraForm(p => ({ ...p, id: e.target.value }))} placeholder="ex: baby_seat" className={cn(inputClass, "w-full uppercase text-xs tracking-widest")} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Libellé</label>
                <input value={extraForm.label} onChange={(e) => setExtraForm(p => ({ ...p, label: e.target.value }))} placeholder="ex: Siège bébé" className={cn(inputClass, "w-full")} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Prix (MAD)</label>
                <input type="number" min={0} value={extraForm.price} onChange={(e) => setExtraForm(p => ({ ...p, price: Number(e.target.value) }))} className={cn(inputClass, "w-full font-bold text-blue-600")} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Facturation</label>
                <select value={extraForm.billingType} onChange={(e) => setExtraForm(p => ({ ...p, billingType: e.target.value as any }))} className={cn(inputClass, "w-full appearance-none")}>
                  <option value="PER_DAY">Par jour</option>
                  <option value="PER_RENTAL">Par location</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Portée</label>
                <select value={extraForm.scope} onChange={(e) => setExtraForm(p => ({ ...p, scope: e.target.value as any, carIds: e.target.value === 'ALL_CARS' ? [] : p.carIds }))} className={cn(inputClass, "w-full appearance-none")}>
                  <option value="ALL_CARS">Toutes les voitures</option>
                  <option value="SELECTED_CARS">Voitures spécifiques</option>
                </select>
              </div>
              <div className="flex items-center pt-8">
                <label className="inline-flex items-center gap-3 cursor-pointer group">
                  <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-all", extraForm.active ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white group-hover:border-blue-400")}>
                    {extraForm.active && <Check size={14} />}
                  </div>
                  <input type="checkbox" checked={extraForm.active} onChange={(e) => setExtraForm(p => ({ ...p, active: e.target.checked }))} className="hidden" />
                  <span className="text-sm font-semibold text-slate-700">Option active</span>
                </label>
              </div>
            </div>

            {extraForm.scope === 'SELECTED_CARS' && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 space-y-4">
                <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">Voitures concernées</p>
                {carsQuery.isLoading ? (
                  <p className="text-xs text-slate-400 italic">Chargement...</p>
                ) : carOptions.length === 0 ? (
                  <p className="text-xs text-slate-400">Aucune voiture disponible.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                    {carOptions.map((car) => (
                      <label key={car.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg cursor-pointer hover:border-blue-200 transition-all">
                        <input type="checkbox" checked={extraForm.carIds.includes(car.id)} onChange={() => toggleCarInForm(car.id)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                        <span className="text-xs font-medium text-slate-700 truncate">{car.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-10 py-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-500 text-sm font-semibold hover:text-slate-700 transition-colors">Annuler</button>
            <Button onClick={handleSubmitModal} disabled={updateMutation.isPending} className="bg-blue-600 text-white hover:bg-blue-700 h-12 px-10 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
              {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : editingIndex === null ? 'Ajouter l\'extra' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
/Modal>
    </div>
  );
};

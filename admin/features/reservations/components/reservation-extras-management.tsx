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
import {
  Settings2,
  Trash2,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
    persistExtras(nextExtras, 'Extra supprimé avec succès');
  };

  const labelClass = "text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1";
  const inputClass = "h-12 bg-slate-50 border-none rounded-xl px-4 font-bold transition-all focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none text-slate-900 placeholder:text-slate-300 text-sm";

  return (
    <div className="max-w-5xl space-y-8 text-left pb-20">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Options & Extras</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Configuration technique et tarification additionnelle.
          </p>
        </div>
        <Button 
           type="button" 
           onClick={handleOpenCreate} 
           className="h-14 bg-slate-950 text-white px-10 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          Ajouter un extra
        </Button>
      </div>

      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-10 shadow-sm space-y-8">
        {submitError && <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600 font-medium">{submitError}</p>}
        {submitSuccess && <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 font-medium">{submitSuccess}</p>}

        {settingsQuery.isLoading ? (
          <div className="h-40 flex flex-col items-center justify-center gap-3">
             <Loader2 className="animate-spin text-slate-200" size={32} />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronisation...</p>
          </div>
        ) : extrasDraft.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-400 font-medium">
            Aucun extra configuré.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="px-6 h-14 font-black text-[10px] text-slate-400 uppercase tracking-widest">Extra / ID</TableHead>
                  <TableHead className="px-6 h-14 font-black text-[10px] text-slate-400 uppercase tracking-widest">Prix</TableHead>
                  <TableHead className="px-6 h-14 font-black text-[10px] text-slate-400 uppercase tracking-widest">Facturation</TableHead>
                  <TableHead className="px-6 h-14 font-black text-[10px] text-slate-400 uppercase tracking-widest">Portée</TableHead>
                  <TableHead className="px-6 h-14 font-black text-[10px] text-slate-400 uppercase tracking-widest">Statut</TableHead>
                  <TableHead className="px-6 h-14 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extrasDraft.map((extra, index) => (
                  <TableRow key={`${extra.id}-${index}`} className="group hover:bg-slate-50 transition-all duration-300 border-slate-50">
                    <TableCell className="px-6 py-5">
                      <div className="font-black text-slate-900 text-base leading-tight">{extra.label}</div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-300 font-black group-hover:text-slate-400 transition-colors">{extra.id}</div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                       <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-sm">{extra.price} MAD</span>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                       <span className="text-xs font-bold text-slate-600">{extra.billingType === 'PER_DAY' ? 'Par jour' : 'Par location'}</span>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                       <span className="text-xs font-bold text-slate-600">{extra.scope === 'ALL_CARS' ? 'Toutes voitures' : `${(extra.carIds || []).length} voiture(s)`}</span>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tight", 
                        extra.active ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                      )}>
                        <div className={cn("w-1 h-1 rounded-full", extra.active ? "bg-indigo-600" : "bg-slate-400")} />
                        {extra.active ? 'Actif' : 'Inactif'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEdit(index)} className="h-10 w-10 flex items-center justify-center hover:bg-slate-900 hover:text-white text-slate-500 rounded-xl transition-all border border-slate-100 hover:border-slate-950"><Settings2 size={16} /></button>
                        <button onClick={() => handleDelete(index)} disabled={updateMutation.isPending} className="h-10 w-10 flex items-center justify-center hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-100"><Trash2 size={16} /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Modal 
         isOpen={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         title={editingIndex === null ? 'Ajouter un extra' : 'Modifier un extra'} 
         contentClassName="max-w-3xl p-0 overflow-hidden rounded-[2.5rem] shadow-2xl border-none"
      >
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
                <input type="number" min={0} value={extraForm.price} onChange={(e) => setExtraForm(p => ({ ...p, price: Number(e.target.value) }))} className={cn(inputClass, "w-full font-black text-emerald-600")} />
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
                  <div className={cn("w-6 h-6 rounded-lg border flex items-center justify-center transition-all", extraForm.active ? "bg-slate-950 border-slate-950 text-white" : "border-slate-200 bg-slate-50 group-hover:border-slate-400")}>
                    {extraForm.active && <Check size={14} />}
                  </div>
                  <input type="checkbox" checked={extraForm.active} onChange={(e) => setExtraForm(p => ({ ...p, active: e.target.checked }))} className="hidden" />
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Option active</span>
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
                      <label key={car.id} className="flex items-center gap-3 p-4 bg-white border-2 border-slate-50 rounded-2xl cursor-pointer hover:border-slate-900 transition-all group">
                        <input type="checkbox" checked={extraForm.carIds.includes(car.id)} onChange={() => toggleCarInForm(car.id)} className="w-5 h-5 rounded-lg border-slate-200 text-slate-950 focus:ring-0" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight group-hover:text-slate-900 truncate">{car.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-10 py-10 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors">Annuler</button>
            <Button onClick={handleSubmitModal} disabled={updateMutation.isPending} className="bg-slate-950 text-white hover:bg-slate-800 h-14 px-12 rounded-2xl font-black shadow-xl shadow-slate-200 active:scale-95 transition-all">
              {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : editingIndex === null ? 'Ajouter l\'extra' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

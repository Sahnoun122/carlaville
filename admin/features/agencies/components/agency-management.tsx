'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAgencies,
  createAgency,
  updateAgency,
  activateAgency,
  deactivateAgency,
  type AgencyFormValues,
} from '@/features/agencies/services/agency-service';
import { AgencyTable } from './agency-table';
import { AgencyForm } from './agency-form';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Agency } from '@/types';
import { Plus, Search, Building2, MapPin, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AgencyManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['agencies', page, searchTerm],
    queryFn: () => getAgencies({ page, limit: 10, q: searchTerm || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: createAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      setIsModalOpen(false);
      toast.success('Agence créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création de l\'agence');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      setIsModalOpen(false);
      toast.success('Agence mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'agence');
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      toast.success('Agence activée');
    },
    onSettled: () => setIsUpdatingStatus(null),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      toast.success('Agence désactivée');
    },
    onSettled: () => setIsUpdatingStatus(null),
  });

  const handleCreate = () => {
    setSelectedAgency(null);
    setIsModalOpen(true);
  };

  const handleEdit = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsModalOpen(true);
  };

  const handleSubmit = (values: AgencyFormValues) => {
    if (selectedAgency) {
      const selectedId = selectedAgency.id || selectedAgency._id || '';
      updateMutation.mutate({ id: selectedId, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleToggleStatus = (id: string, targetActive: boolean) => {
    setIsUpdatingStatus(id);
    if (targetActive) {
      activateMutation.mutate(id);
    } else {
      deactivateMutation.mutate(id);
    }
  };

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Gestion des Agences
          </h1>
          <p className="mt-2 text-slate-500">
            Créez et gérez vos agences partenaires pour la flotte de véhicules.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="h-12 gap-2 bg-slate-900 px-6 font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
        >
          <Plus size={20} />
          Ajouter une agence
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Search Bar */}
        <div className="md:col-span-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
            <input
              type="text"
              placeholder="Rechercher par nom ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 shadow-sm transition-all focus:border-red-200 focus:outline-none focus:ring-4 focus:ring-red-50"
            />
          </div>
        </div>

        {/* Stats / Quick Info */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Agences Actives</p>
              <p className="text-xl font-bold text-slate-900">{data?.count || 0}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-10 w-10 rounded-xl p-0 hover:bg-slate-50"
          >
            <RefreshCcw size={16} className={cn(isRefetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {isLoading && !isRefetching ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
          <div className="flex flex-col items-center gap-2">
            <RefreshCcw className="h-8 w-8 animate-spin text-slate-400" />
            <p className="text-sm font-medium text-slate-500">Chargement des données...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-center p-6">
          <p className="font-bold text-rose-800 uppercase tracking-widest text-xs mb-2">Erreur</p>
          <p className="text-rose-600 text-sm max-w-xs mx-auto">
            Une erreur est survenue lors du chargement des agences. Veuillez réessayer.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4 border-rose-200 text-rose-600 hover:bg-rose-100">
            Réessayer
          </Button>
        </div>
      ) : (
        <AgencyTable
          agencies={data?.agencies || []}
          onEdit={handleEdit}
          onActivate={handleToggleStatus}
          isUpdating={isUpdatingStatus}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAgency ? 'Modifier l\'agence' : 'Créer une agence'}
        contentClassName="max-w-2xl"
      >
        <AgencyForm
          agency={selectedAgency}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
};

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Agency } from '@/types';
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

export const AgencyManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['agencies', page, searchTerm],
    queryFn: () => getAgencies({ page, limit: 10, q: searchTerm || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: createAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      setIsModalOpen(false);
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateAgency,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agencies'] }),
    onSettled: () => setIsUpdatingStatus(null),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAgency,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agencies'] }),
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
    <div className="space-y-6">
      <PageHeader 
        title="Gestion des Agences" 
        description="Créez et gérez vos agences partenaires pour la flotte."
      >
        <Button onClick={handleCreate}>Ajouter une agence</Button>
      </PageHeader>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Rechercher par nom ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
           Chargement des agences...
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
           Erreur lors du chargement des agences.
        </div>
      )}

      {data && (
        <AgencyTable
          agencies={data.agencies}
          onEdit={handleEdit}
          onActivate={handleToggleStatus}
          isUpdating={isUpdatingStatus}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAgency ? 'Modifier l\'agence' : 'Ajouter une agence'}
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

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserFormValues,
} from '@/features/users/services/user-service';
import { UserForm } from '@/features/users/components/user-form';
import { UserTable } from './user-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/shared/page-header';
import { User } from '@/types';

export const UserManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page, searchTerm],
    queryFn: () => getUsers({ page, limit: 10, q: searchTerm || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = (values: UserFormValues) => {
    if (selectedUser) {
      const selectedUserId =
        selectedUser.id || (selectedUser as User & { _id?: string })._id || '';
      updateMutation.mutate({ id: selectedUserId, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Annuaire des Utilisateurs" 
        description="Créer, modifier et gérer les utilisateurs de la plateforme."
      >
        <Button onClick={handleCreate}>Ajouter un utilisateur</Button>
      </PageHeader>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Chargement des utilisateurs...
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Erreur lors du chargement des utilisateurs.
        </div>
      )}
      {data && (
        <UserTable
          users={data.users}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
};

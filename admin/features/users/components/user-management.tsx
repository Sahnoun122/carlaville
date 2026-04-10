'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { Plus, Search, Users, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export const UserManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['users', page, searchTerm],
    queryFn: () => getUsers({ page, limit: 10, q: searchTerm || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      toast.success('Utilisateur créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création de l\'utilisateur');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      toast.success('Utilisateur mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Utilisateur supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression de l\'utilisateur');
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteMutation.mutate(id);
    }
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
    <div className="w-full space-y-10 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-500">
            Gérez les accès et les rôles de votre équipe et de vos clients.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="h-12 w-full gap-2 bg-slate-900 px-6 font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95 sm:w-auto"
        >
          <Plus size={20} />
          Ajouter un utilisateur
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Search Bar */}
        <div className="md:col-span-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou rôle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 shadow-sm transition-all focus:border-red-200 focus:outline-none focus:ring-4 focus:ring-red-50"
            />
          </div>
        </div>

        {/* Stats / Quick Info */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Utilisateurs</p>
              <p className="text-xl font-bold text-slate-900">{data?.count || 0}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-10 w-10 self-start rounded-xl p-0 hover:bg-slate-50 sm:self-auto"
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
            Une erreur est survenue lors du chargement des utilisateurs. Veuillez réessayer.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4 border-rose-200 text-rose-600 hover:bg-rose-100">
            Réessayer
          </Button>
        </div>
      ) : (
        <UserTable
          users={data?.users || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
        contentClassName="max-w-2xl"
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

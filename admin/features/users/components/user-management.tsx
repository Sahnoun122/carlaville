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
import { User } from '@/types';

export const UserManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page],
    queryFn: () => getUsers({ page, limit: 10 }),
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
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Users Directory</h2>
          <p className="text-sm text-slate-500">Create, update and manage platform users.</p>
        </div>
        <Button className="shadow-sm" onClick={handleCreate}>Add User</Button>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Loading users...
        </div>
      )}
      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Error loading users.
        </div>
      )}
      {data && (
        <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <UserTable
            users={data.users}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Edit User' : 'Add User'}
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

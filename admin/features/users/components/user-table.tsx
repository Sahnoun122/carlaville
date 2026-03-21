'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { User } from '@/types';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UserTable = ({ users, onEdit, onDelete }: UserTableProps) => {
  const getUserId = (user: User) => user.id || (user as User & { _id?: string })._id || '';

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={getUserId(user)}>
            <TableCell className="font-medium text-slate-800">{user.name}</TableCell>
            <TableCell className="text-slate-700">{user.email}</TableCell>
            <TableCell>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {user.role}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(getUserId(user))}
                >
                  Supprimer
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

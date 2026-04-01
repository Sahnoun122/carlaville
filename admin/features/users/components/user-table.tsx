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
import { User, Role } from '@/types';
import { Edit2, Trash2, Mail, Phone, ShieldCheck, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UserTable = ({ users, onEdit, onDelete }: UserTableProps) => {
  const getUserId = (user: User) => user.id || (user as User & { _id?: string })._id || '';

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case Role.DELIVERY_AGENT:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case Role.CLIENT:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="w-[300px] py-4 font-semibold text-slate-900">Utilisateur</TableHead>
            <TableHead className="font-semibold text-slate-900">Contact</TableHead>
            <TableHead className="font-semibold text-slate-900">Rôle</TableHead>
            <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                Aucun utilisateur trouvé.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={getUserId(user)} className="group transition-colors hover:bg-slate-50/50">
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600 ring-2 ring-white group-hover:from-red-50 group-hover:to-red-100 group-hover:text-red-700">
                      {getInitials(user.name || 'U')}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{user.name}</span>
                      <span className="text-xs text-slate-500">ID: {getUserId(user).substring(0, 8)}...</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm transition-all",
                    getRoleColor(user.role)
                  )}>
                    <ShieldCheck size={12} />
                    {user.role}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="h-8 w-8 p-0 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit2 size={14} />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(getUserId(user))}
                      className="h-8 w-8 p-0 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

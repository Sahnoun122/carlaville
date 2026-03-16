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
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={getUserId(user)}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(getUserId(user))}
                className="ml-2"
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Agency } from '@/types';
import { FileEdit, CheckCircle2, XCircle } from 'lucide-react';

interface AgencyTableProps {
  agencies: Agency[];
  onEdit: (agency: Agency) => void;
  onActivate: (id: string, activate: boolean) => void;
  isUpdating: string | null;
}

export const AgencyTable = ({ agencies, onEdit, onActivate, isUpdating }: AgencyTableProps) => {
  if (!agencies || agencies.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
        Aucune agence trouvée.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-semibold text-slate-700">Nom</TableHead>
            <TableHead className="font-semibold text-slate-700">Ville</TableHead>
            <TableHead className="font-semibold text-slate-700">Statut</TableHead>
            <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agencies.map((agency) => {
            const agencyId = agency.id || agency._id || '';

            return (
              <TableRow key={agencyId} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-medium text-slate-900">{agency.name}</TableCell>
                <TableCell className="text-slate-600">{agency.city}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      agency.active
                        ? 'border border-emerald-200 bg-emerald-100 text-emerald-800'
                        : 'border border-rose-200 bg-rose-100 text-rose-800'
                    }`}
                  >
                    {agency.active ? 'Actif' : 'Inactif'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(agency)} disabled={isUpdating === agencyId}>
                      <FileEdit className="mr-1.5 h-3.5 w-3.5" />
                      Modifier
                    </Button>
                    {agency.active ? (
                      <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700" onClick={() => onActivate(agencyId, false)} disabled={isUpdating === agencyId}>
                        Désactiver
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="text-emerald-600 hover:text-emerald-700" onClick={() => onActivate(agencyId, true)} disabled={isUpdating === agencyId}>
                        Activer
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

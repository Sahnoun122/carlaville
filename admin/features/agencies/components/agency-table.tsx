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
import { Edit2, Building2, MapPin, CheckCircle2, XCircle, Power, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgencyTableProps {
  agencies: Agency[];
  onEdit: (agency: Agency) => void;
  onActivate: (id: string, activate: boolean) => void;
  isUpdating: string | null;
}

export const AgencyTable = ({ agencies, onEdit, onActivate, isUpdating }: AgencyTableProps) => {
  if (!agencies || agencies.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
        <div className="text-center">
          <Building2 className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <p className="font-medium italic">Aucune agence trouvée.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="py-4 pl-6 font-semibold text-slate-900">Agence</TableHead>
            <TableHead className="font-semibold text-slate-900">Localisation</TableHead>
            <TableHead className="font-semibold text-slate-900">Statut</TableHead>
            <TableHead className="text-right pr-6 font-semibold text-slate-900">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agencies.map((agency) => {
            const agencyId = agency.id || agency._id || '';

            return (
              <TableRow key={agencyId} className="group transition-colors hover:bg-slate-50/50 text-slate-500">
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-2 ring-white transition-all group-hover:bg-red-50 group-hover:text-red-700">
                      <Building2 size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 leading-tight">{agency.name}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">ID: {agencyId.substring(0, 8)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    {agency.city}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-all",
                      agency.active
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50'
                        : 'border-rose-200 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100/50'
                    )}
                  >
                    {agency.active ? (
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    ) : (
                      <XCircle size={12} className="text-rose-500" />
                    )}
                    {agency.active ? 'Actif' : 'Inactif'}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2 items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(agency)} 
                      disabled={isUpdating === agencyId}
                      className="h-9 w-9 p-0 rounded-lg hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-all active:scale-95"
                    >
                      <Edit2 size={14} />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onActivate(agencyId, !agency.active)} 
                      disabled={isUpdating === agencyId}
                      className={cn(
                        "h-9 px-3 gap-2 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all active:scale-95",
                        agency.active 
                          ? "hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700" 
                          : "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      )}
                    >
                      {agency.active ? <PowerOff size={14} /> : <Power size={14} />}
                      {agency.active ? 'Désactiver' : 'Activer'}
                    </Button>
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

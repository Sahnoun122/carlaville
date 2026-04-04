import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Revenue } from '../services/revenue-service';
import { Edit2, DollarSign, Calendar, Car, Building2, Trash2 } from 'lucide-react';

interface RevenueTableProps {
  revenues: Revenue[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
  }).format(amount);
};

const formatDate = (dateString?: string | Date) => {
  if (!dateString) return 'N/A';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch (e) {
    return 'Date invalide';
  }
};

const getCategoryBadge = (category: string) => {
  switch (category) {
    case 'RENTAL':
      return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full text-xs font-bold">Location</span>;
    case 'PENALTY':
      return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1 rounded-full text-xs font-bold">Pénalité</span>;
    case 'INSURANCE':
      return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full text-xs font-bold">Assurance</span>;
    default:
      return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-full text-xs font-bold">Autre</span>;
  }
};

export const RevenueTable = ({ revenues }: RevenueTableProps) => {
  if (!revenues || revenues.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
        <div className="text-center">
          <DollarSign className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <p className="font-medium italic">Aucun revenu trouvé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="py-4 pl-6 font-semibold text-slate-900">Référence</TableHead>
            <TableHead className="font-semibold text-slate-900">Montant Brut</TableHead>
            <TableHead className="font-semibold text-slate-900">Commission</TableHead>
            <TableHead className="font-semibold text-slate-900">Montant Net</TableHead>
            <TableHead className="font-semibold text-slate-900">Date</TableHead>
            <TableHead className="font-semibold text-slate-900">Mode</TableHead>
             <TableHead className="font-semibold text-slate-900">Agence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenues.map((revenue) => {
            const revenueId = revenue.id || revenue._id || '';

            return (
              <TableRow key={revenueId} className="group transition-colors hover:bg-slate-50/50 text-slate-500">
                <TableCell className="py-4 pl-6">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900 uppercase tracking-tight">{revenue.bookingReference}</span>
                    <span className="text-[10px] font-bold text-slate-400">ID: {revenueId.substring(0, 8)}</span>
                  </div>
                </TableCell>
                <TableCell className="font-bold text-slate-900">
                  {formatCurrency(revenue.amount)}
                </TableCell>
                <TableCell className="text-rose-600 font-bold italic">
                  -{formatCurrency(revenue.commissionAmount || 0)}
                </TableCell>
                <TableCell className="font-black text-emerald-600">
                   {formatCurrency(revenue.netAmount || revenue.amount)}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {formatDate(revenue.recognizedDate || (revenue as any).date)}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-600">
                    {revenue.paymentMethod || 'CASH'}
                  </span>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {revenue.agencyId?.name || 'N/A'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

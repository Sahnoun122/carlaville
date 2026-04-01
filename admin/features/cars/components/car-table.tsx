import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Car } from '@/types';
import { Edit2, Archive, Car as CarIcon, MapPin, Gauge, Fuel, Users, Banknote, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CarTableProps {
  cars: Car[];
  onEdit: (car: Car) => void;
  onDelete: (id: string) => void;
}

const resolveCarId = (car: Car) =>
  car.id || (car as Car & { _id?: string })._id || '';

const resolveAgencyName = (car: Car) => {
  const agencyFromCar = car as unknown as {
    agencyId?: unknown;
    agency?: { name?: string };
  };
  if (agencyFromCar.agency?.name) return agencyFromCar.agency.name;
  if (agencyFromCar.agencyId && typeof agencyFromCar.agencyId === 'object') {
    const populatedAgency = agencyFromCar.agencyId as { name?: string };
    if (populatedAgency.name) return populatedAgency.name;
  }
  return '-';
};

const statusConfig: Record<string, { label: string; class: string }> = {
  AVAILABLE: { label: 'Disponible', class: 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50' },
  RESERVED: { label: 'Réservé', class: 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50' },
  MAINTENANCE: { label: 'Maintenance', class: 'border-amber-200 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100/50' },
  UNAVAILABLE: { label: 'Indisponible', class: 'border-rose-200 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100/50' },
};

export const CarTable = ({
  cars,
  onEdit,
  onDelete,
}: CarTableProps) => {
  if (!cars || cars.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-slate-500">
        <div className="text-center">
          <CarIcon className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <p className="font-medium italic">Aucun véhicule disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
      <Table>
        <TableHeader className="bg-slate-50/50 text-slate-900 font-bold">
          <TableRow>
            <TableHead className="py-4 pl-6 font-semibold">Véhicule</TableHead>
            <TableHead className="font-semibold">Agence</TableHead>
            <TableHead className="font-semibold">Spécifications</TableHead>
            <TableHead className="font-semibold text-center">Prix / Jour</TableHead>
            <TableHead className="font-semibold">Statut</TableHead>
            <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cars.map((car) => {
            const carId = resolveCarId(car);
            const status = statusConfig[car.availabilityStatus] || { label: car.availabilityStatus, class: 'bg-slate-100 text-slate-600 border-slate-200' };

            return (
              <TableRow key={carId} className="group transition-colors hover:bg-slate-50/50">
                <TableCell className="py-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-2 ring-white transition-all group-hover:bg-red-50 group-hover:text-red-700">
                      <CarIcon size={20} />
                    </div>
                    <div className="flex flex-col">
                      <Link 
                        href={`/admin/cars/${carId}`}
                        className="font-bold text-slate-900 leading-tight hover:text-red-600 transition-colors"
                      >
                        {car.brand} {car.model}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
                        <span className="text-slate-300">{car.year}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin size={10} />
                          {car.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                    <Building2 size={14} className="text-slate-400" />
                    {resolveAgencyName(car)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      <Gauge size={10} /> {car.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      <Fuel size={10} /> {car.fuelType}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      <Users size={10} /> {car.seats}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-black text-slate-900 text-sm">{car.dailyPrice} <span className="text-[10px] text-slate-400">MAD</span></span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Net par jour</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tight",
                    status.class
                  )}>
                    {status.label}
                  </span>
                </TableCell>

                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2 items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(car)} 
                      className="h-9 w-9 p-0 rounded-lg hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-all active:scale-95"
                    >
                      <Edit2 size={14} />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDelete(carId)} 
                      className="h-9 w-9 p-0 rounded-lg hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-all active:scale-95 text-rose-500"
                    >
                      <Archive size={14} />
                      <span className="sr-only">Archiver</span>
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

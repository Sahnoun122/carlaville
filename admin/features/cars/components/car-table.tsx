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
import { Car } from '@/types';

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

  if (agencyFromCar.agency?.name) {
    return agencyFromCar.agency.name;
  }

  if (agencyFromCar.agencyId && typeof agencyFromCar.agencyId === 'object') {
    const populatedAgency = agencyFromCar.agencyId as { name?: string };
    if (populatedAgency.name) {
      return populatedAgency.name;
    }
  }

  return '-';
};

export const CarTable = ({
  cars,
  onEdit,
  onDelete,
}: CarTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Véhicule</TableHead>
          <TableHead>Agence</TableHead>
          <TableHead>Spécifications</TableHead>
          <TableHead>Tarification</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cars.map((car) => {
          const carId = resolveCarId(car);

          return (
            <TableRow key={carId}>
              <TableCell>
                <div className="font-medium">{car.brand} {car.model}</div>
                <div className="text-xs text-gray-500">{car.year} · {car.city}</div>
              </TableCell>
              <TableCell>{resolveAgencyName(car)}</TableCell>
              <TableCell>
                {car.category} · {car.transmission} · {car.fuelType} · {car.seats} places
              </TableCell>
              <TableCell>
                <div>{car.dailyPrice} / jour</div>
                <div className="text-xs text-gray-500">
                  Caution : {car.depositAmount ?? 0} · Livraison : {car.deliveryFee ?? 0}
                </div>
              </TableCell>
              <TableCell>{car.availabilityStatus}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onEdit(car)}>
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(carId)}
                  className="ml-2"
                >
                  Archiver
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

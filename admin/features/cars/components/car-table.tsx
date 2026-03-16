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
          <TableHead>Vehicle</TableHead>
          <TableHead>Agency</TableHead>
          <TableHead>Specs</TableHead>
          <TableHead>Pricing</TableHead>
          <TableHead>Status</TableHead>
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
                {car.category} · {car.transmission} · {car.fuelType} · {car.seats} seats
              </TableCell>
              <TableCell>
                <div>{car.dailyPrice} / day</div>
                <div className="text-xs text-gray-500">
                  Deposit: {car.depositAmount ?? 0} · Delivery: {car.deliveryFee ?? 0}
                </div>
              </TableCell>
              <TableCell>{car.availabilityStatus}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onEdit(car)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(carId)}
                  className="ml-2"
                >
                  Archive
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

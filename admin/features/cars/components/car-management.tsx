'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Car, Agency } from '@/types';
import {
  createCar,
  deleteCar,
  getAgencies,
  getCars,
  updateCar,
  type CarFormValues,
} from '@/features/cars/services/car-service';
import { CarForm } from './car-form';

const resolveCarId = (car: Car) =>
  car.id || (car as Car & { _id?: string })._id || '';

const resolveAgencyId = (car: Car) => {
  const rawAgencyId = (car as unknown as { agencyId?: unknown }).agencyId;

  if (!rawAgencyId) {
    return '';
  }

  if (typeof rawAgencyId === 'string') {
    return rawAgencyId;
  }

  const populatedAgency = rawAgencyId as { id?: string; _id?: string };
  return populatedAgency.id || populatedAgency._id || '';
};

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

const statusBadgeClass: Record<string, string> = {
  AVAILABLE: 'border border-emerald-200 bg-emerald-100 text-emerald-800',
  RESERVED: 'border border-blue-200 bg-blue-100 text-blue-800',
  MAINTENANCE: 'border border-amber-200 bg-amber-100 text-amber-800',
  UNAVAILABLE: 'border border-rose-200 bg-rose-100 text-rose-800',
};

export const CarManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const carsQuery = useQuery({
    queryKey: ['cars', page],
    queryFn: () => getCars({ page, limit: 10 }),
  });

  const agenciesQuery = useQuery({
    queryKey: ['agencies', 'for-cars'],
    queryFn: () => getAgencies(),
  });

  const createMutation = useMutation({
    mutationFn: createCar,
    onSuccess: () => {
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setIsModalOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to create vehicle.';

      setSubmitError(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCar,
    onSuccess: () => {
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setIsModalOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to update vehicle.';

      setSubmitError(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });

  const handleCreate = () => {
    setSubmitError(null);
    setSelectedCar(null);
    setIsModalOpen(true);
  };

  const handleEdit = (car: Car) => {
    setSubmitError(null);
    setSelectedCar({
      ...car,
      id: resolveCarId(car),
      agencyId: resolveAgencyId(car),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = (values: CarFormValues) => {
    if (selectedCar) {
      updateMutation.mutate({ id: resolveCarId(selectedCar), ...values });
      return;
    }

    createMutation.mutate(values);
  };

  const agencies: Agency[] = agenciesQuery.data?.agencies ?? [];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate}>
          Add Vehicle
        </Button>
      </div>

      {carsQuery.isLoading && <p>Loading vehicles...</p>}
      {carsQuery.isError && <p>Error loading vehicles</p>}

      {carsQuery.data && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {carsQuery.data.cars.map((car) => {
            const carId = resolveCarId(car);
            const previewImage = car.images?.[0];

            return (
              <article
                key={carId}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={`${car.brand} ${car.model}`}
                    className="mb-4 h-44 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-44 w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                    No image
                  </div>
                )}

                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-sm text-slate-500">{car.year} · {car.city}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusBadgeClass[car.availabilityStatus] ||
                      'border border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                  >
                    {car.availabilityStatus}
                  </span>
                </div>

                <p className="mb-1 text-sm text-slate-700">
                  {car.category} · {car.transmission} · {car.fuelType}
                </p>
                <p className="mb-1 text-sm text-slate-700">
                  {car.seats} seats · Luggage: {car.luggage ?? 0}
                </p>
                <p className="mb-4 text-sm text-slate-700">
                  Agency: {resolveAgencyName(car)}
                </p>

                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="font-semibold text-slate-800">{car.dailyPrice} MAD / day</div>
                  <div className="mt-1 text-slate-600">
                    Deposit: {car.depositAmount ?? 0} · Delivery: {car.deliveryFee ?? 0}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/cars/${carId}`}>
                    <Button size="sm" variant="outline">View Details</Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(car)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(carId)}
                    disabled={deleteMutation.isPending}
                  >
                    Archive
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCar ? 'Edit Vehicle' : 'Add Vehicle'}
      >
        {submitError && (
          <p className="mb-3 text-sm text-red-600">{submitError}</p>
        )}
        <CarForm
          car={selectedCar}
          agencies={agencies}
          onSubmit={handleSubmit}
          isLoading={
            agenciesQuery.isLoading ||
            createMutation.isPending ||
            updateMutation.isPending
          }
        />
      </Modal>
    </div>
  );
};

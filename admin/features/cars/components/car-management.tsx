'use client';

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
import { CarTable } from './car-table';

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
        <CarTable
          cars={carsQuery.data.cars}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
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

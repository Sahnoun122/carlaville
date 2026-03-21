'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { PageHeader } from '@/components/shared/page-header';
import { Car, Agency } from '@/types';
import {
  createCar,
  deleteCar,
  getCars,
  updateCar,
  type CarFormValues,
} from '@/features/cars/services/car-service';
import { CarForm } from './car-form';
import { getAgencies } from '@/features/agencies/services/agency-service';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgency, setFilterAgency] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const carsQuery = useQuery({
    queryKey: ['cars', page, searchTerm, filterAgency],
    queryFn: () => getCars({ 
      page, 
      limit: 10, 
      q: searchTerm || undefined,
      agencyId: filterAgency !== 'ALL' ? filterAgency : undefined 
    }),
  });

  const agenciesQuery = useQuery({
    queryKey: ['agencies', 'for-cars'],
    queryFn: () => getAgencies({ page: 1, limit: 100 }),
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
          : 'Échec de l\'ajout du véhicule.';

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
          : 'Échec de la modification du véhicule.';

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
    <div className="space-y-6">
      <PageHeader 
        title="Gestion des Véhicules" 
        description="Gérez la flotte de véhicules, ajoutez des voitures et mettez à jour les statuts."
      >
        <Button onClick={handleCreate}>Ajouter un Véhicule</Button>
      </PageHeader>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] gap-4">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Rechercher par marque, modèle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <div className="w-full md:w-1/4">
          <select
            value={filterAgency}
            onChange={(e) => setFilterAgency(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
          >
            <option value="ALL">Toutes les agences</option>
            {agencies.map((agency) => (
              <option key={agency.id || agency._id} value={agency.id || agency._id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {carsQuery.isLoading && <p>Chargement des véhicules...</p>}
      {carsQuery.isError && <p>Erreur lors du chargement des véhicules</p>}

      {carsQuery.data && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {carsQuery.data.cars.map((car) => {
            const carId = resolveCarId(car);
            const previewImage = car.images?.[0];

            return (
              <article
                key={carId}
                className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={`${car.brand} ${car.model}`}
                    className="mb-4 h-44 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-44 w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                    Aucune image
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
                  {car.seats} places · Bagages : {car.luggage ?? 0}
                </p>
                <p className="mb-4 text-sm text-slate-700">
                  Agence : {resolveAgencyName(car)}
                </p>

                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div className="font-semibold text-slate-800">{car.dailyPrice} MAD / jour</div>
                  <div className="mt-1 text-slate-600">
                    Caution : {car.depositAmount ?? 0} MAD · Livraison : {car.deliveryFee ?? 0} MAD
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/cars/${carId}`}>
                    <Button size="sm" variant="outline">Détails</Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(car)}>
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(carId)}
                    disabled={deleteMutation.isPending}
                  >
                    Archiver
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
        title={selectedCar ? 'Modifier le Véhicule' : 'Ajouter un Véhicule'}
        contentClassName="max-w-4xl"
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

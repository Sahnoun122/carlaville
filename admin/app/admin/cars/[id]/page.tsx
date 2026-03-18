'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';
import { getCarById } from '@/features/cars/services/car-service';

const CarDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const carId = useMemo(() => (params?.id ? String(params.id) : ''), [params?.id]);

  const carQuery = useQuery({
    queryKey: ['car', carId],
    queryFn: () => getCarById(carId),
    enabled: carId.length > 0,
  });

  const car = carQuery.data;

  return (
    <div>
      <PageHeader title="Vehicle Details">
        <Link href="/admin/cars">
          <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Back to Vehicles
          </button>
        </Link>
      </PageHeader>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {carQuery.isLoading && <p className="text-sm text-slate-600">Loading vehicle details...</p>}
        {carQuery.isError && <p className="text-sm text-rose-600">Unable to load vehicle details.</p>}

        {car ? (
          <article className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {car.brand} {car.model}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {car.year} · {car.city} · {car.category}
                </p>
              </div>
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {car.availabilityStatus}
              </span>
            </div>

            {car.images?.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {car.images.map((imageUrl) => (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={`${car.brand} ${car.model}`}
                    className="h-56 w-full rounded-lg border border-slate-200 object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">
                No photos uploaded
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Specs</p>
                <p className="mt-2 text-sm text-slate-700">Transmission: {car.transmission}</p>
                <p className="text-sm text-slate-700">Fuel: {car.fuelType}</p>
                <p className="text-sm text-slate-700">Seats: {car.seats}</p>
                <p className="text-sm text-slate-700">Luggage: {car.luggage ?? 0}</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pricing</p>
                <p className="mt-2 text-sm text-slate-700">Daily: {car.dailyPrice} MAD</p>
                <p className="text-sm text-slate-700">Deposit: {car.depositAmount ?? 0} MAD</p>
                <p className="text-sm text-slate-700">Delivery fee: {car.deliveryFee ?? 0} MAD</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Agency</p>
                <p className="mt-2 text-sm text-slate-700">{car.agency?.name || 'No agency'}</p>
                <p className="text-sm text-slate-700">Status: {car.active ? 'Active' : 'Archived'}</p>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
};

export default CarDetailsPage;

'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { AvailabilityStatus, Car, MaintenanceRecord } from '@/types';
import {
  completeCarMaintenance,
  getCarMaintenanceHistory,
  getCars,
  startCarMaintenance,
} from '@/features/cars/services/car-service';

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

  return 'No agency';
};

interface CarMaintenanceManagementProps {
  readOnly?: boolean;
}

export const CarMaintenanceManagement = ({
  readOnly = false,
}: CarMaintenanceManagementProps) => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState<'start' | 'complete'>('start');
  const [maintenanceCar, setMaintenanceCar] = useState<Car | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [maintenanceCost, setMaintenanceCost] = useState('');
  const [maintenanceNextStatus, setMaintenanceNextStatus] = useState<AvailabilityStatus>(AvailabilityStatus.AVAILABLE);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyCarLabel, setHistoryCarLabel] = useState('');
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);

  const carsQuery = useQuery({
    queryKey: ['cars', 'maintenance', page],
    queryFn: () => getCars({ page, limit: 50 }),
  });

  const startMaintenanceMutation = useMutation({
    mutationFn: startCarMaintenance,
    onSuccess: () => {
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setIsMaintenanceModalOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to start maintenance.';

      setSubmitError(message);
    },
  });

  const completeMaintenanceMutation = useMutation({
    mutationFn: completeCarMaintenance,
    onSuccess: () => {
      setSubmitError(null);
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setIsMaintenanceModalOpen(false);
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to complete maintenance.';

      setSubmitError(message);
    },
  });

  const handleOpenStartMaintenance = (car: Car) => {
    setSubmitError(null);
    setMaintenanceCar(car);
    setMaintenanceMode('start');
    setMaintenanceReason('');
    setMaintenanceNotes('');
    setMaintenanceCost('');
    setMaintenanceNextStatus(AvailabilityStatus.AVAILABLE);
    setIsMaintenanceModalOpen(true);
  };

  const handleOpenCompleteMaintenance = (car: Car) => {
    setSubmitError(null);
    setMaintenanceCar(car);
    setMaintenanceMode('complete');
    setMaintenanceReason('');
    setMaintenanceNotes('');
    setMaintenanceCost('');
    setMaintenanceNextStatus(AvailabilityStatus.AVAILABLE);
    setIsMaintenanceModalOpen(true);
  };

  const handleViewMaintenanceHistory = async (car: Car) => {
    const carId = resolveCarId(car);
    if (!carId) {
      return;
    }

    try {
      const response = await getCarMaintenanceHistory(carId);
      setHistoryCarLabel(response.carLabel);
      setMaintenanceHistory(response.history);
      setIsHistoryModalOpen(true);
    } catch {
      setSubmitError('Failed to load maintenance history.');
    }
  };

  const handleSubmitMaintenance = () => {
    const carId = maintenanceCar ? resolveCarId(maintenanceCar) : '';

    if (!carId) {
      return;
    }

    if (maintenanceMode === 'start') {
      if (!maintenanceReason.trim()) {
        setSubmitError('Maintenance reason is required.');
        return;
      }

      startMaintenanceMutation.mutate({
        id: carId,
        reason: maintenanceReason.trim(),
        notes: maintenanceNotes.trim() || undefined,
        estimatedCost:
          maintenanceCost.trim().length > 0
            ? Number(maintenanceCost)
            : undefined,
      });
      return;
    }

    completeMaintenanceMutation.mutate({
      id: carId,
      notes: maintenanceNotes.trim() || undefined,
      finalCost:
        maintenanceCost.trim().length > 0 ? Number(maintenanceCost) : undefined,
      nextAvailabilityStatus: maintenanceNextStatus,
    });
  };

  return (
    <div className="space-y-5">
      {submitError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p>
      )}

      {carsQuery.isLoading && <p className="text-sm text-slate-600">Loading vehicles...</p>}
      {carsQuery.isError && <p className="text-sm text-rose-600">Error loading vehicles.</p>}

      {carsQuery.data && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Agency</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carsQuery.data.cars.map((car) => {
                const carId = resolveCarId(car);
                return (
                  <tr key={carId} className="border-t border-slate-200 text-slate-700 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{car.brand} {car.model}</div>
                      <div className="text-xs text-slate-500">{car.year} · {car.city}</div>
                    </td>
                    <td className="px-4 py-3">{resolveAgencyName(car)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {car.availabilityStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!readOnly &&
                        (car.availabilityStatus === AvailabilityStatus.MAINTENANCE ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCompleteMaintenance(car)}
                          >
                            Complete
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenStartMaintenance(car)}
                          >
                            Start
                          </Button>
                        ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className={!readOnly ? 'ml-2' : ''}
                        onClick={() => handleViewMaintenanceHistory(car)}
                      >
                        History
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title={maintenanceMode === 'start' ? 'Start Maintenance' : 'Complete Maintenance'}
      >
        {maintenanceMode === 'start' && (
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Reason</label>
              <input
                value={maintenanceReason}
                onChange={(event) => setMaintenanceReason(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Estimated Cost</label>
              <input
                type="number"
                value={maintenanceCost}
                onChange={(event) => setMaintenanceCost(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={maintenanceNotes}
                onChange={(event) => setMaintenanceNotes(event.target.value)}
                className="w-full min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
          </div>
        )}

        {maintenanceMode === 'complete' && (
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Final Cost</label>
              <input
                type="number"
                value={maintenanceCost}
                onChange={(event) => setMaintenanceCost(event.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={maintenanceNotes}
                onChange={(event) => setMaintenanceNotes(event.target.value)}
                className="w-full min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Next Status</label>
              <select
                value={maintenanceNextStatus}
                onChange={(event) =>
                  setMaintenanceNextStatus(event.target.value as AvailabilityStatus)
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value={AvailabilityStatus.AVAILABLE}>available</option>
                <option value={AvailabilityStatus.UNAVAILABLE}>unavailable</option>
                <option value={AvailabilityStatus.RENTED}>rented</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSubmitMaintenance}
            disabled={startMaintenanceMutation.isPending || completeMaintenanceMutation.isPending}
          >
            {maintenanceMode === 'start' ? 'Start' : 'Complete'} Maintenance
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Maintenance History - ${historyCarLabel}`}
      >
        {maintenanceHistory.length === 0 ? (
          <p className="text-sm text-slate-600">No maintenance history found.</p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {maintenanceHistory.map((record, index) => (
              <div key={`${record.startedAt}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="font-medium text-slate-800">{record.reason}</p>
                <p className="text-xs text-slate-500">
                  Start: {new Date(record.startedAt).toLocaleString()}
                </p>
                {record.endedAt && (
                  <p className="text-xs text-slate-500">
                    End: {new Date(record.endedAt).toLocaleString()}
                  </p>
                )}
                {typeof record.estimatedCost === 'number' && <p className="text-xs text-slate-700">Estimated: {record.estimatedCost}</p>}
                {typeof record.finalCost === 'number' && <p className="text-xs text-slate-700">Final: {record.finalCost}</p>}
                {record.notes && <p className="mt-1 text-xs text-slate-700">{record.notes}</p>}
                <p className="mt-1 text-xs text-slate-700">Status: {record.status}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

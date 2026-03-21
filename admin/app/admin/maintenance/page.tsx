'use client';

import { PageHeader } from '@/components/shared/page-header';
import { CarMaintenanceManagement } from '@/features/cars/components/car-maintenance-management';

const MaintenancePage = () => {
  return (
    <div>
      <PageHeader title="Maintenance des Véhicules" />
      <div className="p-6">
        <CarMaintenanceManagement />
      </div>
    </div>
  );
};

export default MaintenancePage;

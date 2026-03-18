'use client';

import { PageHeader } from '@/components/shared/page-header';
import { CarMaintenanceManagement } from '@/features/cars/components/car-maintenance-management';

const OperationsMaintenancePage = () => {
  return (
    <div>
      <PageHeader title="Maintenance" />
      <div className="p-6">
        <CarMaintenanceManagement readOnly />
      </div>
    </div>
  );
};

export default OperationsMaintenancePage;

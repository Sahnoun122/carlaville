'use client';

import { PageHeader } from '@/components/shared/page-header';
import { CarManagement } from '@/features/cars/components/car-management';

const CarsPage = () => {
  return (
    <div>
      <PageHeader title="Vehicle Management" />
      <div className="p-6">
        <CarManagement />
      </div>
    </div>
  );
};

export default CarsPage;

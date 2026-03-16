'use client';

import { PageHeader } from '@/components/shared/page-header';
import { OperationsDeliveriesManagement } from '@/features/deliveries/components/operations-deliveries-management';

const OperationsDeliveriesPage = () => {
  return (
    <div>
      <PageHeader title="My Deliveries" />
      <div className="p-6">
        <OperationsDeliveriesManagement />
      </div>
    </div>
  );
};

export default OperationsDeliveriesPage;

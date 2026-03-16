'use client';

import { PageHeader } from '@/components/shared/page-header';
import { AdminDeliveriesManagement } from '@/features/deliveries/components/admin-deliveries-management';

const AdminDeliveriesPage = () => {
  return (
    <div>
      <PageHeader title="Delivery Management" />
      <div className="p-6">
        <AdminDeliveriesManagement />
      </div>
    </div>
  );
};

export default AdminDeliveriesPage;

import { Metadata } from 'next';
import { RevenueManagement } from '@/features/revenues/components/revenue-management';

export const metadata: Metadata = {
  title: 'Gestion Revenus - Carlaville',
  description: 'Hub centralisé pour le suivi automatique et l\'analyse du chiffre d\'affaires.',
};

export default function ManualRevenuesPage() {
  return (
    <div className="animate-in fade-in duration-700">
      <RevenueManagement />
    </div>
  );
}

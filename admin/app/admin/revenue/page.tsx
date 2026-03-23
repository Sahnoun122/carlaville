'use client';

import { PageHeader } from '@/components/shared/page-header';
import { RevenueAnalytics } from '@/features/dashboard/components/revenue-analytics';

export default function RevenuePage() {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <PageHeader 
        title="Analyse des Revenus" 
        description="Suivez la performance financière de votre flotte en temps réel."
      />
      
      <div className="mt-8">
        <RevenueAnalytics />
      </div>
    </div>
  );
}

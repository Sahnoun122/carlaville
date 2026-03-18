'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';

const ReservationSettingsPage = () => {
  return (
    <div>
      <PageHeader title="Paramètres de réservation" />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Partie Dates</h2>
            <p className="mt-2 text-sm text-slate-500">
              Gérer les règles de dates: min/max jours, réservation le jour même, jours bloqués.
            </p>
            <div className="mt-5">
              <Link href="/admin/reservations/settings/dates">
                <Button>Modifier les dates</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Partie Options & Extras</h2>
            <p className="mt-2 text-sm text-slate-500">
              Gérer les extras, prix automatiques, et application sur toutes les voitures ou des voitures spécifiques.
            </p>
            <div className="mt-5">
              <Link href="/admin/reservations/settings/extras">
                <Button>Modifier les extras</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationSettingsPage;

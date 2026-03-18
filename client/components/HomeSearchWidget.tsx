"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Search } from 'lucide-react';

interface DayControlSettings {
  minRentalDays: number;
  maxRentalDays: number;
  maxAdvanceBookingDays: number;
  allowSameDayBooking: boolean;
}

const formatDate = (value: Date) => value.toISOString().split('T')[0];

const addDaysToDateString = (dateString: string, days: number) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return formatDate(date);
};

export default function HomeSearchWidget() {
  const router = useRouter();
  const [settings, setSettings] = useState<DayControlSettings | null>(null);
  const [location, setLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');

  useEffect(() => {
    const loadDayControlSettings = async () => {
      try {
        const res = await fetch('http://localhost:3009/api/reservations/settings/day-control', {
          cache: 'no-store',
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        setSettings({
          minRentalDays: data.minRentalDays,
          maxRentalDays: data.maxRentalDays,
          maxAdvanceBookingDays: data.maxAdvanceBookingDays,
          allowSameDayBooking: data.allowSameDayBooking,
        });
      } catch {
      }
    };

    loadDayControlSettings();
  }, []);

  const todayStr = formatDate(new Date());
  const minRentalDays = Math.max(1, settings?.minRentalDays ?? 1);
  const maxRentalDays = Math.max(minRentalDays, settings?.maxRentalDays ?? 30);
  const pickupMinDate = settings?.allowSameDayBooking
    ? todayStr
    : addDaysToDateString(todayStr, 1);
  const pickupMaxDate = settings
    ? addDaysToDateString(todayStr, settings.maxAdvanceBookingDays)
    : undefined;

  useEffect(() => {
    if (!pickupDate) {
      const start = pickupMinDate;
      setPickupDate(start);
      setReturnDate(addDaysToDateString(start, minRentalDays - 1));
      return;
    }

    if (pickupDate < pickupMinDate) {
      setPickupDate(pickupMinDate);
      setReturnDate(addDaysToDateString(pickupMinDate, minRentalDays - 1));
      return;
    }

    if (!returnDate) {
      setReturnDate(addDaysToDateString(pickupDate, minRentalDays - 1));
    }
  }, [pickupDate, returnDate, pickupMinDate, minRentalDays]);

  const returnMinDate = pickupDate
    ? addDaysToDateString(pickupDate, minRentalDays - 1)
    : pickupMinDate;
  const returnMaxDate = pickupDate
    ? addDaysToDateString(pickupDate, maxRentalDays - 1)
    : undefined;

  const handlePickupDateChange = (value: string) => {
    setPickupDate(value);

    if (!value) {
      return;
    }

    const minAllowedReturn = addDaysToDateString(value, minRentalDays - 1);
    const maxAllowedReturn = addDaysToDateString(value, maxRentalDays - 1);

    if (!returnDate || returnDate < minAllowedReturn) {
      setReturnDate(minAllowedReturn);
      return;
    }

    if (returnDate > maxAllowedReturn) {
      setReturnDate(maxAllowedReturn);
    }
  };

  const startDate = new Date(pickupDate);
  const endDate = new Date(returnDate);
  let days = 1;

  if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
    const diffTime = endDate.getTime() - startDate.getTime();
    days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  let calendarRuleError = '';
  if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
    if (days < minRentalDays) {
      calendarRuleError = `Durée minimale autorisée: ${minRentalDays} jour(s).`;
    } else if (days > maxRentalDays) {
      calendarRuleError = `Durée maximale autorisée: ${maxRentalDays} jour(s).`;
    }
  }

  const handleSearch = () => {
    if (calendarRuleError) {
      return;
    }

    const params = new URLSearchParams();
    if (location.trim().length > 0) {
      params.set('location', location.trim());
    }
    params.set('pickupDate', pickupDate);
    params.set('returnDate', returnDate);
    params.set('pickupTime', pickupTime);
    params.set('returnTime', returnTime);

    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 -mb-45 max-w-5xl mx-auto text-left transform translate-y-16 border border-gray-100 relative z-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Départ / Retour</label>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Aéroport, Ville..."
            className="p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-black transition-all font-medium"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Date de départ</label>
          <div className="flex gap-2">
            <input
              type="date"
              min={pickupMinDate}
              max={pickupMaxDate}
              value={pickupDate}
              onChange={(event) => handlePickupDateChange(event.target.value)}
              className="p-4 w-2/3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-black transition-all font-medium"
            />
            <input
              type="time"
              value={pickupTime}
              onChange={(event) => setPickupTime(event.target.value)}
              className="p-4 w-1/3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-black transition-all font-medium px-2"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Date de retour</label>
          <div className="flex gap-2">
            <input
              type="date"
              min={returnMinDate}
              max={returnMaxDate}
              value={returnDate}
              onChange={(event) => setReturnDate(event.target.value)}
              className="p-4 w-2/3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-black transition-all font-medium"
            />
            <input
              type="time"
              value={returnTime}
              onChange={(event) => setReturnTime(event.target.value)}
              className="p-4 w-1/3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-black transition-all font-medium px-2"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <button
            onClick={handleSearch}
            disabled={Boolean(calendarRuleError)}
            className="w-full bg-primary text-white p-4 rounded-xl font-extrabold text-lg hover:bg-primary-hover transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <Search className="w-6 h-6" />
            Rechercher
          </button>
        </div>
      </div>

    </div>
  );
}

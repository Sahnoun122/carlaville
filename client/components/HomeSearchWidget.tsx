"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Search, Clock } from 'lucide-react';

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

        if (!res.ok) return;

        const data = await res.json();
        setSettings({
          minRentalDays: data.minRentalDays,
          maxRentalDays: data.maxRentalDays,
          maxAdvanceBookingDays: data.maxAdvanceBookingDays,
          allowSameDayBooking: data.allowSameDayBooking,
        });
      } catch {}
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
      setReturnDate(addDaysToDateString(start, minRentalDays));
      return;
    }

    if (pickupDate < pickupMinDate) {
      setPickupDate(pickupMinDate);
      setReturnDate(addDaysToDateString(pickupMinDate, minRentalDays));
      return;
    }
  }, [pickupDate, pickupMinDate, minRentalDays]);

  const returnMinDate = pickupDate
    ? addDaysToDateString(pickupDate, minRentalDays)
    : pickupMinDate;
  const returnMaxDate = pickupDate
    ? addDaysToDateString(pickupDate, maxRentalDays)
    : undefined;

  const handlePickupDateChange = (value: string) => {
    setPickupDate(value);
    const minAllowedReturn = addDaysToDateString(value, minRentalDays);
    if (!returnDate || returnDate < minAllowedReturn) {
      setReturnDate(minAllowedReturn);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim().length > 0) params.set('location', location.trim());
    params.set('pickupDate', pickupDate);
    params.set('returnDate', returnDate);
    params.set('pickupTime', pickupTime);
    params.set('returnTime', returnTime);
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto transform translate-y-12 relative z-30 group px-4">
      <div className="bg-white rounded-2xl lg:rounded-full p-2 lg:p-3 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-0">
        
        {/* Destination Zone */}
        <div className="flex-[1.2] px-8 py-3 lg:py-0 flex flex-col justify-center min-w-[200px] hover:bg-gray-50/80 transition-colors rounded-t-xl lg:rounded-l-full lg:rounded-tr-none">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-primary" /> Destination
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Où allez-vous ?"
            className="bg-transparent border-none p-0 focus:ring-0 outline-none text-sm font-bold text-gray-900 placeholder:text-gray-300 w-full"
          />
        </div>

        {/* Pickup Zone */}
        <div className="flex-1 px-8 py-3 lg:py-0 flex flex-col justify-center hover:bg-gray-50/80 transition-colors">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Calendar className="w-3 h-3 text-primary" /> Départ
          </label>
          <div className="flex items-center gap-3">
            <input
              type="date"
              min={pickupMinDate}
              max={pickupMaxDate}
              value={pickupDate}
              onChange={(e) => handlePickupDateChange(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 outline-none text-xs font-bold text-gray-900 w-full cursor-pointer"
            />
            <div className="w-px h-3 bg-gray-100 shrink-0"></div>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 outline-none text-xs font-bold text-gray-900 w-16 cursor-pointer"
            />
          </div>
        </div>

        {/* Return Zone */}
        <div className="flex-1 px-8 py-3 lg:py-0 flex flex-col justify-center hover:bg-gray-50/80 transition-colors">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Clock className="w-3 h-3 text-primary" /> Retour
          </label>
          <div className="flex items-center gap-3">
            <input
              type="date"
              min={returnMinDate}
              max={returnMaxDate}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 outline-none text-xs font-bold text-gray-900 w-full cursor-pointer"
            />
            <div className="w-px h-3 bg-gray-100 shrink-0"></div>
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 outline-none text-xs font-bold text-gray-900 w-16 cursor-pointer"
            />
          </div>
        </div>

        {/* Search Button Zone */}
        <div className="lg:pl-6 py-2 lg:py-0 pr-2 lg:pr-3 flex items-center">
          <button
            onClick={handleSearch}
            className="w-full lg:w-auto px-12 py-4 bg-primary text-white rounded-xl lg:rounded-full font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-neutral-900 transition-all shadow-xl shadow-red-600/20 active:scale-95 group/btn"
          >
            <Search className="w-4 h-4" />
            Rechercher
          </button>
        </div>

      </div>
      
      {/* Quick Info Tags */}
      <div className="flex flex-wrap items-center gap-4 mt-6 ml-1 opacity-40">
         <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Kilométrage illimité</span>
         </div>
         <div className="flex items-center gap-1.5 border-l border-gray-100 pl-4">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Assistance 24/7</span>
         </div>
         <div className="flex items-center gap-1.5 border-l border-gray-100 pl-4">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Assurance comprise</span>
         </div>
      </div>
    </div>
  );
}

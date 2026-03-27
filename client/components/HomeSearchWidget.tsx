"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Search, Clock, Plane, Zap, Shield } from 'lucide-react';

interface DayControlSettings {
  minRentalDays: number;
  maxRentalDays: number;
  maxAdvanceBookingDays: number;
  allowSameDayBooking: boolean;
}

const formatDate = (value: Date) => value.toISOString().split('T')[0];

const AIRPORTS = [
  { city: 'Casablanca', name: 'Aéroport Mohammed V', code: 'CMN' },
  { city: 'Marrakech', name: 'Aéroport Menara', code: 'RAK' },
  { city: 'Agadir', name: 'Aéroport Al Massira', code: 'AGA' },
  { city: 'Tanger', name: 'Aéroport Ibn Battouta', code: 'TNG' },
  { city: 'Rabat', name: 'Aéroport Rabat-Salé', code: 'RBA' },
  { city: 'Fès', name: 'Aéroport Saïss', code: 'FEZ' },
  { city: 'Nador', name: 'Aéroport Al Aroui', code: 'NDR' },
  { city: 'Oujda', name: 'Aéroport Angads', code: 'OJD' },
  { city: 'Tétouan', name: 'Aéroport Saniat R\'mel', code: 'TTU' },
  { city: 'Dakhla', name: 'Aéroport de Dakhla', code: 'VIL' },
  { city: 'Laâyoune', name: 'Aéroport Hassan I', code: 'EUN' },
  { city: 'Essaouira', name: 'Aéroport Mogador', code: 'ESU' },
  { city: 'Ouarzazate', name: 'Aéroport de Ouarzazate', code: 'OZZ' },
];

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

  // Autocomplete State
  const [suggestions, setSuggestions] = useState(AIRPORTS);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && (event.target as HTMLElement).closest('.airport-dropdown-container') === null) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (val.length > 0) {
      const searchVal = val.toLowerCase();
      const filtered = AIRPORTS.filter(a => 
        a.city.toLowerCase().includes(searchVal) || 
        a.code.toLowerCase().includes(searchVal) ||
        (a.name.toLowerCase().replace('aéroport', '').trim().includes(searchVal))
      );
      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setSuggestions(AIRPORTS);
      setShowDropdown(false);
    }
  };

  const selectAirport = (airport: any) => {
    setLocation(`${airport.city} (${airport.code})`);
    setShowDropdown(false);
  };

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
    <div className="max-w-6xl mx-auto transform translate-y-4 lg:translate-y-12 relative z-30 group px-4 lg:px-0">
      {/* Main Search Bar Container */}
      <div className="bg-white lg:bg-gray-50 rounded-3xl lg:rounded-full p-2 lg:p-4 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)] flex flex-col lg:flex-row items-stretch lg:items-center gap-1 lg:gap-0">
        
        {/* Destination Zone */}
        <div className="flex-[1.2] px-6 lg:px-12 py-4 lg:py-0 flex flex-col justify-center min-w-[200px] hover:bg-gray-50 transition-all duration-300 rounded-2xl lg:rounded-l-full lg:rounded-tr-none relative airport-dropdown-container border-b lg:border-b-0 lg:border-r border-gray-100/50">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2 pl-1">
            <MapPin className="w-3 h-3 text-primary" /> Destination
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
            onFocus={() => location.length > 0 && setShowDropdown(true)}
            placeholder="Où allez-vous ?"
            className="bg-transparent border-none p-0 focus:ring-0 outline-none text-sm font-bold text-gray-900 placeholder:text-gray-300 w-full pl-1"
          />

          {/* Airport Suggestions Dropdown - Compact Version */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full lg:w-[280px] bg-gray-50 mt-2 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="max-h-[220px] overflow-y-auto airport-scroll">
                {suggestions.map((airport, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => selectAirport(airport)}
                    className="px-5 py-2.5 hover:bg-primary hover:text-white cursor-pointer flex items-center justify-between group/item transition-all border-b border-gray-50 last:border-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold leading-tight">{airport.city}</span>
                      <span className="text-[9px] opacity-60 truncate max-w-[150px] leading-tight mt-0.5">{airport.name.replace('Aéroport ', '')}</span>
                    </div>
                    <span className="text-[10px] font-black opacity-40 group-hover/item:opacity-100 transition-opacity">{airport.code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pickup Zone */}
        <div className="flex-1 px-6 lg:px-12 py-4 lg:py-0 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-100/50 hover:bg-gray-50 transition-all duration-300 rounded-xl lg:rounded-none">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
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
            <div className="w-px h-3 bg-gray-50 shrink-0"></div>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 outline-none text-xs font-bold text-gray-900 w-16 cursor-pointer"
            />
          </div>
        </div>

        {/* Return Zone */}
        <div className="flex-1 px-6 lg:px-12 py-4 lg:py-0 flex flex-col justify-center hover:bg-gray-50 transition-all duration-300 rounded-xl lg:rounded-none">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
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
            <div className="w-px h-3 bg-gray-50 shrink-0"></div>
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 outline-none text-xs font-bold text-gray-900 w-16 cursor-pointer"
            />
          </div>
        </div>

        {/* Search Button Zone */}
        <div className="lg:pl-10 p-2 lg:py-0 pr-2 lg:pr-5 flex items-center">
          <button
            onClick={handleSearch}
            className="w-full lg:w-auto px-10 lg:px-14 py-4 bg-primary text-white rounded-2xl lg:rounded-full font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-neutral-900 transition-all duration-300 shadow-xl shadow-red-600/20 active:scale-95 group/btn h-[56px] lg:h-[64px] hover:scale-[1.02]"
          >
            <Search className="w-4 h-4 lg:w-5 lg:h-5" />
            Rechercher
          </button>
        </div>

      </div>
      
      {/* Quick Info Tags - Optimized Premium Look */}
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-8 ml-1">
         <InfoTag icon={<Zap className="w-3 h-3 text-primary" />} text="Kilométrage illimité" />
         <InfoTag icon={<Shield className="w-3 h-3 text-primary" />} text="Assurance comprise" />
         <InfoTag icon={<Clock className="w-3 h-3 text-primary" />} text="Assistance 24/7" />
      </div>
    </div>
  );
}

const InfoTag = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/50 backdrop-blur-sm border border-gray-100 rounded-full shadow-sm">
    {icon}
    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{text}</span>
  </div>
);


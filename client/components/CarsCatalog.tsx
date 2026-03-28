"use client";
import { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, ChevronRight } from 'lucide-react';
import VehicleCard from './VehicleCard';
import { useTranslations } from 'next-intl';

export default function CarsCatalog({
  initialCars,
  initialSearch = '',
}: {
  initialCars: any[];
  initialSearch?: string;
}) {
  const t = useTranslations('cars.filters');
  const tc = useTranslations('cars');

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('ALL');
  const [transmission, setTransmission] = useState('ALL');
  const [fuel, setFuel] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'|'none'>('none');

  const categories = useMemo(() => ['ALL', ...Array.from(new Set(initialCars.map(c => c.category))).filter(Boolean)], [initialCars]);
  const transmissions = useMemo(() => ['ALL', ...Array.from(new Set(initialCars.map(c => c.transmission))).filter(Boolean)], [initialCars]);
  const fuels = useMemo(() => ['ALL', ...Array.from(new Set(initialCars.map(c => c.fuelType))).filter(Boolean)], [initialCars]);

  const filteredCars = useMemo(() => {
    let result = [...initialCars];

    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.brand?.toLowerCase().includes(q) || 
        c.model?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q)
      );
    }

    if (category !== 'ALL') result = result.filter(c => c.category === category);
    if (transmission !== 'ALL') result = result.filter(c => c.transmission === transmission);
    if (fuel !== 'ALL') result = result.filter(c => c.fuelType === fuel);

    if (sortOrder === 'asc') {
      result.sort((a, b) => a.dailyPrice - b.dailyPrice);
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.dailyPrice - a.dailyPrice);
    }

    return result;
  }, [initialCars, search, category, transmission, fuel, sortOrder]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-12 pb-20">
      {/* Simple Sidebar Filters */}
      <aside className="w-full lg:w-72 space-y-8 h-fit sticky top-28">
        <div className="flex items-center justify-between border-b pb-4">
           <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              {t('title')}
           </h2>
           <button 
             onClick={() => {
               setSearch(''); setCategory('ALL'); setTransmission('ALL'); setFuel('ALL'); setSortOrder('none');
             }}
             className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors"
           >
             {t('reset')}
           </button>
        </div>

        <div className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700">{t('search_label')}</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={t('search_placeholder')} 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-premium pl-10 py-2.5 text-sm"
              />
            </div>
          </div>

          <SimpleFilter 
            label={t('category')} 
            value={category} 
            onChange={setCategory} 
            options={categories} 
            placeholder={t('all_categories')} 
          />

          <SimpleFilter 
            label={t('transmission')} 
            value={transmission} 
            onChange={setTransmission} 
            options={transmissions} 
            placeholder={t('all_transmissions')} 
          />

          <SimpleFilter 
            label={t('fuel')} 
            value={fuel} 
            onChange={setFuel} 
            options={fuels} 
            placeholder={t('all_fuels')} 
          />

          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700">{t('sort_label')}</label>
             <div className="flex gap-2">
                <SortBtn active={sortOrder === 'asc'} onClick={() => setSortOrder('asc')} label={t('sort_low')} />
                <SortBtn active={sortOrder === 'desc'} onClick={() => setSortOrder('desc')} label={t('sort_high')} />
             </div>
          </div>
        </div>
      </aside>

      {/* Main Grid View */}
      <main className="flex-1 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
           <p className="text-sm font-medium text-gray-500">
             <span className="text-gray-900 font-bold">{filteredCars.length}</span> {tc('results_count')}
           </p>
        </div>

        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
            {filteredCars.map(car => (
              <VehicleCard key={car._id} car={car} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-400 font-medium">
             {tc('no_results')}
          </div>
        )}
      </main>
    </div>
  );
}

const SimpleFilter = ({ label, value, onChange, options, placeholder }: any) => (
  <div className="space-y-2">
     <label className="text-xs font-bold text-gray-700">{label}</label>
     <select 
       value={value} 
       onChange={e => onChange(e.target.value)}
       className="input-premium py-2.5 text-sm cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19%209-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')]"
       style={{ backgroundSize: '1.25rem' }}
     >
       {options.map((opt: string) => (
         <option key={opt} value={opt}>{opt === 'ALL' ? placeholder : opt}</option>
       ))}
     </select>
  </div>
);

const SortBtn = ({ active, onClick, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-2 rounded-lg border text-xs font-bold transition-all ${
      active 
      ? 'bg-primary text-white border-primary shadow-sm' 
      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
    }`}
  >
    {label}
  </button>
);


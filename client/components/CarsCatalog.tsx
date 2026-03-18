"use client";
import { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import VehicleCard from './VehicleCard';

export default function CarsCatalog({ initialCars }: { initialCars: any[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [transmission, setTransmission] = useState('ALL');
  const [fuel, setFuel] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'|'none'>('none');

  // Extract unique filter options from the available cars
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

    if (category !== 'ALL') {
      result = result.filter(c => c.category === category);
    }
    if (transmission !== 'ALL') {
      result = result.filter(c => c.transmission === transmission);
    }
    if (fuel !== 'ALL') {
      result = result.filter(c => c.fuelType === fuel);
    }

    if (sortOrder === 'asc') {
      result.sort((a, b) => a.dailyPrice - b.dailyPrice);
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.dailyPrice - a.dailyPrice);
    }

    return result;
  }, [initialCars, search, category, transmission, fuel, sortOrder]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-1/4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <Filter className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
        </div>

        <div className="space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Recherche</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Marque, modèle, ville..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Category */}
          {categories.length > 1 && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'ALL' ? 'Toutes les catégories' : cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Transmission */}
          {transmissions.length > 1 && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Transmission</label>
              <select 
                value={transmission} 
                onChange={e => setTransmission(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              >
                {transmissions.map(t => (
                  <option key={t} value={t}>{t === 'ALL' ? 'Toutes' : t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Fuel */}
          {fuels.length > 1 && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Carburant</label>
              <select 
                value={fuel} 
                onChange={e => setFuel(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              >
                {fuels.map(f => (
                  <option key={f} value={f}>{f === 'ALL' ? 'Tous' : f}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sort */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Prix</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'none' : 'asc')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-semibold transition-colors ${sortOrder === 'asc' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                <SortAsc className="w-4 h-4" /> Croissant
              </button>
              <button 
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'none' : 'desc')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-semibold transition-colors ${sortOrder === 'desc' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                <SortDesc className="w-4 h-4" /> Décroissant
              </button>
            </div>
          </div>
          
          {/* Reset */}
          <button 
            onClick={() => {
              setSearch(''); setCategory('ALL'); setTransmission('ALL'); setFuel('ALL'); setSortOrder('none');
            }}
            className="w-full py-3 text-gray-500 font-bold hover:text-primary transition-colors text-sm"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </aside>

      {/* Main Grid */}
      <main className="flex-1">
        <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-600 font-semibold">
            <span className="text-primary font-extrabold text-lg mr-1">{filteredCars.length}</span> 
            véhicule{filteredCars.length !== 1 && 's'} trouvé{filteredCars.length !== 1 && 's'}
          </p>
        </div>

        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCars.map(car => (
              <VehicleCard key={car._id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Essayez de modifier vos filtres ou de rechercher une autre marque ou modèle.</p>
          </div>
        )}
      </main>
    </div>
  );
}

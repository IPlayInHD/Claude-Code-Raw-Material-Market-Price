import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import MaterialCard from './MaterialCard';

const CATEGORIES = ['All', 'Metals', 'Aggregates', 'Building Materials', 'Pipes & Insulation'];

export default function Dashboard({ materials, forecasts, flashMap }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const forecastMap = useMemo(() => {
    const map = {};
    (forecasts || []).forEach((f) => { map[f.materialId] = f; });
    return map;
  }, [forecasts]);

  const filtered = useMemo(() => {
    return (materials || []).filter((m) => {
      const matchCat = category === 'All' || m.category === category;
      const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [materials, category, search]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-slate-500" />
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          <p>No materials match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              forecast={forecastMap[m.id]}
              flashClass={
                flashMap?.[m.id] === 'up' ? 'flash-up' :
                flashMap?.[m.id] === 'down' ? 'flash-down' : ''
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { 
  Search, 
  Sparkles, 
  Compass, 
  Footprints, 
  CreditCard, 
  Flame, 
  Store,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { RAMEN_STYLES } from '../data/ramenStyles';
import { RamenStyleKey } from '../types/ramen';

interface FilterBarProps {
  searchMode: 'nearby' | 'vibe';
  onSetSearchMode: (mode: 'nearby' | 'vibe') => void;
  query: string;
  onSetQuery: (q: string) => void;
  selectedStyle: RamenStyleKey;
  onSelectStyle: (style: RamenStyleKey) => void;
  radiusMeters: number;
  onSelectRadius: (meters: number) => void;
  cashlessOnly: boolean;
  onToggleCashless: () => void;
  specialistOnly: boolean;
  onToggleSpecialist: () => void;
  spicyOnly: boolean;
  onToggleSpicy: () => void;
  totalCount: number;
  onTriggerSearch: () => void;
  isLoading: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchMode,
  onSetSearchMode,
  query,
  onSetQuery,
  selectedStyle,
  onSelectStyle,
  radiusMeters,
  onSelectRadius,
  cashlessOnly,
  onToggleCashless,
  specialistOnly,
  onToggleSpecialist,
  spicyOnly,
  onToggleSpicy,
  totalCount,
  onTriggerSearch,
  isLoading,
}) => {
  const radiusOptions = [
    { label: '300m', meters: 300, sub: '4 min' },
    { label: '500m', meters: 500, sub: '6 min' },
    { label: '1km', meters: 1000, sub: '12 min' },
    { label: '2km', meters: 2000, sub: '25 min' },
    { label: '5km', meters: 5000, sub: 'Area' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onTriggerSearch();
    }
  };

  return (
    <div className="bg-stone-900 border-b border-stone-800 p-3 md:p-4 space-y-3">
      {/* Search Mode Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Mode Selector Tabs */}
        <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-800 flex-shrink-0 self-start sm:self-auto">
          <button
            onClick={() => onSetSearchMode('nearby')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              searchMode === 'nearby'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Nearby GPS</span>
          </button>
          <button
            onClick={() => onSetSearchMode('vibe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              searchMode === 'vibe'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Craving & Vibe</span>
          </button>
        </div>

        {/* Input Field */}
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3 text-stone-400 pointer-events-none">
            {searchMode === 'nearby' ? (
              <Search className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => onSetQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              searchMode === 'nearby'
                ? 'Search shop name or chain (e.g. Ichiran, Ippudo, Rokurinsha)...'
                : 'Describe your craving (e.g. "thick creamy tonkotsu", "yuzu shio", "heavy garlic")...'
            }
            className="w-full pl-9 pr-20 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs md:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />

          {query && (
            <button
              onClick={() => onSetQuery('')}
              className="absolute right-12 text-stone-400 hover:text-stone-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onTriggerSearch}
            disabled={isLoading}
            className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all disabled:opacity-50"
          >
            {isLoading ? '...' : 'Go'}
          </button>
        </div>
      </div>

      {/* Walking Radius Filter (Visible in Nearby Mode) */}
      {searchMode === 'nearby' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-400 flex-shrink-0">
            <Footprints className="w-3.5 h-3.5 text-amber-500" />
            <span>Radius:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {radiusOptions.map((opt) => (
              <button
                key={opt.meters}
                onClick={() => onSelectRadius(opt.meters)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${
                  radiusMeters === opt.meters
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold'
                    : 'bg-stone-950/80 border-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>{opt.label}</span>
                <span className="text-[10px] text-stone-400 font-normal">({opt.sub})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ramen Styles (Keito Lineage) Scrollable Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
        <span className="text-[11px] font-semibold text-stone-400 flex-shrink-0">
          Style:
        </span>
        <div className="flex items-center gap-1.5 flex-nowrap">
          {RAMEN_STYLES.map((style) => {
            const isActive = selectedStyle === style.key;
            return (
              <button
                key={style.key}
                onClick={() => onSelectStyle(style.key)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <span>{style.label}</span>
                <span className={`text-[10px] ${isActive ? 'text-stone-900' : 'text-amber-500'}`}>
                  {style.label_ja}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Traveler Preference Toggles */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/60 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Specialist toggle */}
          <button
            onClick={onToggleSpecialist}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-all ${
              specialistOnly
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                : 'bg-stone-950/40 border-stone-800/80 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Specialist (専門店) Only</span>
          </button>

          {/* Cashless OK */}
          <button
            onClick={onToggleCashless}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-all ${
              cashlessOnly
                ? 'bg-blue-500/15 border-blue-500/50 text-blue-300 font-semibold'
                : 'bg-stone-950/40 border-stone-800/80 text-stone-400 hover:text-stone-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cashless / Card OK</span>
          </button>

          {/* Spicy Signature */}
          <button
            onClick={onToggleSpicy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-all ${
              spicyOnly
                ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 font-semibold'
                : 'bg-stone-950/40 border-stone-800/80 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Spicy Focus</span>
          </button>
        </div>

        {/* Total Result Counter */}
        <div className="text-[11px] text-stone-400 font-mono">
          Showing <span className="font-bold text-amber-400">{totalCount}</span> stores
        </div>
      </div>
    </div>
  );
};

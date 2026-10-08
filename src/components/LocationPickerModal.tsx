import React, { useState } from 'react';
import { 
  X, 
  Navigation, 
  MapPin, 
  Search, 
  Check, 
  Compass, 
  Building2,
  AlertCircle
} from 'lucide-react';
import { POPULAR_TRAVEL_LOCATIONS } from '../data/travelLocations';
import { TravelLocation } from '../types/ramen';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: { lat: number; lng: number; label: string; isGps: boolean };
  onSelectLocation: (loc: { lat: number; lng: number; label: string; isGps: boolean }) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  if (!isOpen) return null;

  const regions = ['All', 'Tokyo', 'Osaka', 'Kyoto', 'Kyushu', 'Hokkaido', 'Kanagawa'];

  const filteredLocations = POPULAR_TRAVEL_LOCATIONS.filter((loc) => {
    const matchesRegion = selectedRegion === 'All' || loc.region === selectedRegion;
    const matchesSearch =
      loc.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      loc.name_ja.includes(filterQuery) ||
      loc.prefecture.toLowerCase().includes(filterQuery.toLowerCase()) ||
      loc.description.toLowerCase().includes(filterQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        onSelectLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: `GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
          isGps: true,
        });
        onClose();
      },
      (err) => {
        setGpsLoading(false);
        let msg = 'Could not retrieve your location.';
        if (err.code === 1) msg = 'Location permission denied. Please allow location access or choose a travel hub below.';
        else if (err.code === 2) msg = 'Position unavailable. Try selecting a nearby station.';
        else if (err.code === 3) msg = 'Location request timed out.';
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-xl max-h-[90vh] bg-stone-900 border border-stone-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-stone-100">
              Select Your Location in Japan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="p-4 border-b border-stone-800 bg-gradient-to-b from-stone-900 to-stone-950">
          <button
            onClick={handleUseGps}
            disabled={gpsLoading}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-semibold text-sm transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
                <Navigation className={`w-5 h-5 ${gpsLoading ? 'animate-spin' : ''}`} />
              </div>
              <div className="text-left">
                <div className="text-stone-100 font-bold text-sm">
                  Use My Current Real GPS
                </div>
                <div className="text-xs text-amber-400/90 font-normal">
                  Find nearest ramen within walking distance
                </div>
              </div>
            </div>
            {currentLocation.isGps && (
              <span className="flex items-center gap-1 text-xs bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-md">
                <Check className="w-3.5 h-3.5" /> Active
              </span>
            )}
          </button>

          {gpsError && (
            <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Travel Hubs / Preset Stations */}
        <div className="p-4 border-b border-stone-800 bg-stone-950/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              Popular Traveler Hubs & Stations
            </span>
            <span className="text-[11px] text-stone-400">
              {filteredLocations.length} locations
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station (e.g. Shinjuku, Hakata, Dotonbori)..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedRegion === region
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Location List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[360px] divide-y divide-stone-800/60">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              No station found matching your search. Try another query or use GPS.
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const isSelected =
                !currentLocation.isGps &&
                Math.abs(currentLocation.lat - loc.lat) < 0.001 &&
                Math.abs(currentLocation.lng - loc.lng) < 0.001;

              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    onSelectLocation({
                      lat: loc.lat,
                      lng: loc.lng,
                      label: `${loc.name} (${loc.name_ja})`,
                      isGps: false,
                    });
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                    isSelected
                      ? 'bg-amber-500/10 border border-amber-500/40 text-stone-100'
                      : 'hover:bg-stone-800/60 text-stone-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-100">
                        {loc.name}
                      </span>
                      <span className="text-xs text-amber-400 font-medium font-sans">
                        {loc.name_ja}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                      {loc.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                      <span>{loc.prefecture}</span>
                      <span>·</span>
                      <span className="font-mono">{loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

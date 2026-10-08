import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { RamenCard } from './components/RamenCard';
import { RamenMap } from './components/RamenMap';
import { LocationPickerModal } from './components/LocationPickerModal';
import { RamenDetailModal } from './components/RamenDetailModal';
import { OrderingGuideModal } from './components/OrderingGuideModal';
import { McpStatusModal } from './components/McpStatusModal';
import { BookmarksModal } from './components/BookmarksModal';
import { ramenMcpClient } from './services/mcpClient';
import { RamenShop, RamenStyleKey, McpServerStatus } from './types/ramen';
import { 
  Soup, 
  Map as MapIcon, 
  ListFilter, 
  Bookmark, 
  BookOpen, 
  RefreshCw, 
  AlertCircle,
  Compass,
  Sparkles,
  ArrowUp
} from 'lucide-react';

const DEFAULT_LOCATION = {
  lat: 35.6909,
  lng: 139.7002,
  label: 'Shinjuku Station (新宿駅)',
  isGps: false,
};

export default function App() {
  // Location State
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
    isGps: boolean;
  }>(() => {
    const saved = localStorage.getItem('gachi_last_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_LOCATION;
      }
    }
    return DEFAULT_LOCATION;
  });

  // Search & Filter State
  const [searchMode, setSearchMode] = useState<'nearby' | 'vibe'>('nearby');
  const [query, setQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<RamenStyleKey>('all');
  const [radiusMeters, setRadiusMeters] = useState(1500);
  const [specialistOnly, setSpecialistOnly] = useState(false);
  const [cashlessOnly, setCashlessOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Data & Results
  const [shops, setShops] = useState<RamenShop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Selected Shop for Modal
  const [selectedShop, setSelectedShop] = useState<RamenShop | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Modals
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isOrderingGuideOpen, setIsOrderingGuideOpen] = useState(false);
  const [isMcpStatusOpen, setIsMcpStatusOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<RamenShop[]>(() => {
    try {
      const saved = localStorage.getItem('gachi_ramen_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // MCP Status
  const [mcpStatus, setMcpStatus] = useState<McpServerStatus>(ramenMcpClient.getStatus());

  // Save Bookmarks
  useEffect(() => {
    localStorage.setItem('gachi_ramen_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Save Location
  useEffect(() => {
    localStorage.setItem('gachi_last_location', JSON.stringify(currentLocation));
  }, [currentLocation]);

  // Refresh MCP status
  const refreshMcpStatus = useCallback(() => {
    setMcpStatus(ramenMcpClient.getStatus());
  }, []);

  // Fetch Ramen Shops
  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (searchMode === 'vibe' && query.trim()) {
        // Natural language Vibe search
        const result = await ramenMcpClient.vibeSearch({
          q: query.trim(),
          limit: 30,
        });

        // Enrich with distance if coordinates are present
        const enriched = result.shops.map((shop) => {
          if (shop.lat && shop.lng && currentLocation.lat && currentLocation.lng) {
            const dist = calculateDistanceMeters(
              currentLocation.lat,
              currentLocation.lng,
              shop.lat,
              shop.lng
            );
            return { ...shop, distance_m: dist };
          }
          return shop;
        });

        setShops(enriched);
        setTotalCount(enriched.length);
      } else {
        // Nearby Geo-radius search
        const result = await ramenMcpClient.searchRamen({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          radius_m: radiusMeters,
          keito: selectedStyle !== 'all' ? selectedStyle : undefined,
          q: query.trim() || undefined,
          shop_type: specialistOnly ? 'senmon' : undefined,
          spice_level: spicyOnly ? 'spicy' : undefined,
          limit: 40,
        });

        let filtered = result.shops || [];

        // Apply cashless filter client-side if required
        if (cashlessOnly) {
          filtered = filtered.filter(
            (s) => s.payment?.card_accepted || s.payment?.state === 'cashless_ok'
          );
        }

        // Sort by distance ascending
        filtered.sort((a, b) => (a.distance_m ?? 99999) - (b.distance_m ?? 99999));

        setShops(filtered);
        setTotalCount(result.total_matched || filtered.length);
      }

      refreshMcpStatus();
    } catch (err: any) {
      console.error('Failed to query Gachi Ramen MCP:', err);
      setErrorMessage(
        err.message || 'Could not fetch ramen shops from MCP endpoint. Please check connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    searchMode,
    query,
    currentLocation,
    radiusMeters,
    selectedStyle,
    specialistOnly,
    cashlessOnly,
    spicyOnly,
    refreshMcpStatus,
  ]);

  // Initial fetch and on dependencies change
  useEffect(() => {
    fetchShops();
  }, [
    currentLocation.lat,
    currentLocation.lng,
    radiusMeters,
    selectedStyle,
    specialistOnly,
    cashlessOnly,
    spicyOnly,
    searchMode,
  ]);

  // Bookmark Toggle
  const handleToggleBookmark = (shop: RamenShop) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === shop.id);
      if (exists) {
        return prev.filter((b) => b.id !== shop.id);
      } else {
        return [...prev, shop];
      }
    });
  };

  const handleOpenDetail = (shop: RamenShop) => {
    setSelectedShop(shop);
    setIsDetailOpen(true);
  };

  const handleSelectLocation = (loc: {
    lat: number;
    lng: number;
    label: string;
    isGps: boolean;
  }) => {
    setCurrentLocation(loc);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans pb-16 sm:pb-0">
      {/* Top Header */}
      <Header
        currentLocation={currentLocation}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        onOpenOrderingGuide={() => setIsOrderingGuideOpen(true)}
        onOpenMcpStatus={() => setIsMcpStatusOpen(true)}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        bookmarkCount={bookmarks.length}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === 'list' ? 'map' : 'list'))}
        onRefresh={fetchShops}
        isLoading={isLoading}
        mcpConnected={mcpStatus.connected}
      />

      {/* Filter and Query Bar */}
      <FilterBar
        searchMode={searchMode}
        onSetSearchMode={setSearchMode}
        query={query}
        onSetQuery={setQuery}
        selectedStyle={selectedStyle}
        onSelectStyle={setSelectedStyle}
        radiusMeters={radiusMeters}
        onSelectRadius={setRadiusMeters}
        cashlessOnly={cashlessOnly}
        onToggleCashless={() => setCashlessOnly((prev) => !prev)}
        specialistOnly={specialistOnly}
        onToggleSpecialist={() => setSpecialistOnly((prev) => !prev)}
        spicyOnly={spicyOnly}
        onToggleSpicy={() => setSpicyOnly((prev) => !prev)}
        totalCount={shops.length}
        onTriggerSearch={fetchShops}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Error Alert */}
        {errorMessage && (
          <div className="max-w-7xl mx-auto px-4 pt-4 w-full">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <div className="font-bold">MCP Connection Notice</div>
                <div>{errorMessage}</div>
              </div>
              <button
                onClick={fetchShops}
                className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-850 text-rose-200 font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* View Mode: Map View */}
        {viewMode === 'map' ? (
          <div className="flex-1 min-h-[500px] h-[calc(100vh-210px)] relative">
            <RamenMap
              shops={shops}
              userLat={currentLocation.lat}
              userLng={currentLocation.lng}
              userLabel={currentLocation.label}
              selectedShop={selectedShop}
              onSelectShop={(shop) => {
                setSelectedShop(shop);
                setIsDetailOpen(true);
              }}
              radiusMeters={radiusMeters}
            />
          </div>
        ) : (
          /* View Mode: Card List */
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 w-full flex-1">
            {isLoading && shops.length === 0 ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-2xl bg-stone-900/50 border border-stone-800/60 animate-pulse p-4 space-y-3"
                  >
                    <div className="h-4 bg-stone-800 rounded w-1/3" />
                    <div className="h-6 bg-stone-800 rounded w-3/4" />
                    <div className="h-4 bg-stone-800 rounded w-1/2" />
                    <div className="h-10 bg-stone-850 rounded w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : shops.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16 px-4 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-3xl shadow-lg">
                  🍜
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-200">
                    No Ramen Shops Found Nearby
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    We scanned the Gachi-Ramen 62k+ database within {radiusMeters}m of{' '}
                    <span className="text-stone-300 font-semibold">{currentLocation.label}</span>.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setRadiusMeters(5000);
                      setSelectedStyle('all');
                      setSpecialistOnly(false);
                      setCashlessOnly(false);
                      setSpicyOnly(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
                  >
                    Expand Radius to 5km & Reset Filters
                  </button>
                  <button
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-medium text-xs border border-stone-800 transition-colors"
                  >
                    Pick Another Station
                  </button>
                </div>
              </div>
            ) : (
              /* Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shops.map((shop) => (
                  <RamenCard
                    key={shop.id}
                    shop={shop}
                    isBookmarked={bookmarks.some((b) => b.id === shop.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onOpenDetail={handleOpenDetail}
                    userLat={currentLocation.lat}
                    userLng={currentLocation.lng}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Scroll to Top button in list mode */}
      {viewMode === 'list' && shops.length > 6 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 sm:bottom-6 right-4 z-20 p-3 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-700 shadow-xl backdrop-blur-md transition-all active:scale-90"
          title="Scroll to top"
        >
          <ArrowUp className="w-4 h-4 text-amber-500" />
        </button>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Travel App Feel) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-stone-950/95 border-t border-stone-800 backdrop-blur-md py-1.5 px-3 flex items-center justify-around">
        <button
          onClick={() => setViewMode('list')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
            viewMode === 'list' ? 'text-amber-400' : 'text-stone-400'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Stores</span>
        </button>

        <button
          onClick={() => setViewMode('map')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
            viewMode === 'map' ? 'text-amber-400' : 'text-stone-400'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setIsLocationPickerOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold text-stone-400 hover:text-stone-200 transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>Location</span>
        </button>

        <button
          onClick={() => setIsBookmarksOpen(true)}
          className="relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold text-stone-400 hover:text-stone-200 transition-colors"
        >
          <Bookmark className="w-4 h-4" />
          {bookmarks.length > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-stone-950 text-[9px] font-black flex items-center justify-center">
              {bookmarks.length}
            </span>
          )}
          <span>Saved</span>
        </button>

        <button
          onClick={() => setIsOrderingGuideOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold text-stone-400 hover:text-stone-200 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Guide</span>
        </button>
      </nav>

      {/* Modals */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={handleSelectLocation}
      />

      <RamenDetailModal
        shop={selectedShop}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedShop(null);
        }}
        isBookmarked={selectedShop ? bookmarks.some((b) => b.id === selectedShop.id) : false}
        onToggleBookmark={handleToggleBookmark}
        userLat={currentLocation.lat}
        userLng={currentLocation.lng}
      />

      <OrderingGuideModal
        isOpen={isOrderingGuideOpen}
        onClose={() => setIsOrderingGuideOpen(false)}
      />

      <McpStatusModal
        isOpen={isMcpStatusOpen}
        onClose={() => setIsMcpStatusOpen(false)}
        status={mcpStatus}
        onRefreshStatus={refreshMcpStatus}
      />

      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={(id) => setBookmarks((prev) => prev.filter((b) => b.id !== id))}
        onSelectShop={handleOpenDetail}
        onClearAll={() => setBookmarks([])}
      />
    </div>
  );
}

/**
 * Haversine distance in meters
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

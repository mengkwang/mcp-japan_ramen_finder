import React from 'react';
import { 
  MapPin, 
  Bookmark, 
  BookOpen, 
  Server, 
  Map as MapIcon, 
  ListFilter,
  Flame,
  RotateCcw
} from 'lucide-react';
import { TravelLocation } from '../types/ramen';

interface HeaderProps {
  currentLocation: { lat: number; lng: number; label: string; isGps: boolean };
  onOpenLocationPicker: () => void;
  onOpenOrderingGuide: () => void;
  onOpenMcpStatus: () => void;
  onOpenBookmarks: () => void;
  bookmarkCount: number;
  viewMode: 'list' | 'map';
  onToggleViewMode: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  mcpConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onOpenLocationPicker,
  onOpenOrderingGuide,
  onOpenMcpStatus,
  onOpenBookmarks,
  bookmarkCount,
  viewMode,
  onToggleViewMode,
  onRefresh,
  isLoading,
  mcpConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-950/50 flex-shrink-0">
            <span className="text-xl select-none" role="img" aria-label="Ramen">🍜</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight text-stone-100 flex items-center gap-1">
                Gachi Ramen <span className="text-amber-500 font-black text-xs md:text-sm">ガチ</span>
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-mono text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                62k+ Shops
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate">
              Japan Authentic Ramen Radar
            </p>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* MCP Health Trigger */}
          <button
            onClick={onOpenMcpStatus}
            title="Inspect MCP Endpoint Connection"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                mcpConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="hidden md:inline font-mono text-[11px] text-stone-300">
              MCP API
            </span>
          </button>

          {/* Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            title="Saved Ramen Bucket List"
            className="relative p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 transition-colors"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Ordering Guide (Traveler Survival Sheet) */}
          <button
            onClick={onOpenOrderingGuide}
            title="Japan Ramen Ordering Cheat Sheet"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Order Guide</span>
          </button>

          {/* View Mode Switcher (List vs Map) */}
          <button
            onClick={onToggleViewMode}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              viewMode === 'map'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-200 border-stone-800'
            }`}
          >
            {viewMode === 'map' ? (
              <>
                <ListFilter className="w-3.5 h-3.5" />
                <span>Cards</span>
              </>
            ) : (
              <>
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Location Selector Bar */}
      <div className="bg-stone-900/90 border-t border-stone-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onOpenLocationPicker}
            className="flex items-center gap-2 min-w-0 text-left group hover:opacity-90 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                  {currentLocation.isGps ? 'Your Live GPS' : 'Target Station / Hub'}
                </span>
                <span className="text-[10px] text-amber-500 font-medium underline underline-offset-2">
                  Change
                </span>
              </div>
              <p className="text-xs md:text-sm font-semibold text-stone-100 truncate">
                {currentLocation.label}
              </p>
            </div>
          </button>

          {/* Refresh / Re-scan button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Scan</span>
          </button>
        </div>
      </div>
    </header>
  );
};

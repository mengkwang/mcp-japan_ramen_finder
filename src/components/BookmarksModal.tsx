import React from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  ExternalLink, 
  Navigation,
  Train,
  ChevronRight
} from 'lucide-react';
import { RamenShop } from '../types/ramen';
import { getStyleInfo } from '../data/ramenStyles';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: RamenShop[];
  onRemoveBookmark: (shopId: string) => void;
  onSelectShop: (shop: RamenShop) => void;
  onClearAll: () => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onSelectShop,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-xl max-h-[90vh] bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div>
              <h2 className="text-base font-bold text-stone-100">
                Your Saved Ramen Bucket List
              </h2>
              <p className="text-[11px] text-stone-400">
                {bookmarks.length} stores curated for your Japan trip
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center mx-auto text-xl">
                🍜
              </div>
              <h3 className="font-bold text-sm text-stone-200">
                No Bookmarked Ramen Shops Yet
              </h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
                Tap the bookmark ribbon icon on any ramen card to save shops to your Japan travel itinerary.
              </p>
            </div>
          ) : (
            bookmarks.map((shop) => {
              const primaryStyle = shop.keito?.[0] ? getStyleInfo(shop.keito[0]) : null;

              return (
                <div
                  key={shop.id}
                  onClick={() => {
                    onSelectShop(shop);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-stone-950/70 hover:bg-stone-800/80 border border-stone-800 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-stone-100 group-hover:text-amber-400 transition-colors truncate">
                        {shop.name}
                      </h4>
                      {primaryStyle && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${primaryStyle.badgeColor} flex-shrink-0`}>
                          {primaryStyle.label_ja}
                        </span>
                      )}
                    </div>

                    {shop.name_en && (
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        {shop.name_en}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
                      <span>{shop.pref} {shop.city}</span>
                      {shop.station && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-stone-300">
                            <Train className="w-3 h-3 text-amber-500" />
                            {shop.station.name}駅 ({shop.station.distance_meters}m)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(shop.id);
                      }}
                      className="p-2 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Remove from bucket list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {bookmarks.length > 0 && (
          <div className="p-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

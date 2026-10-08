import React, { useState } from 'react';
import { 
  MapPin, 
  Footprints, 
  Train, 
  CreditCard, 
  Coins, 
  Bookmark, 
  ExternalLink, 
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  Flame
} from 'lucide-react';
import { RamenShop } from '../types/ramen';
import { getStyleInfo } from '../data/ramenStyles';

interface RamenCardProps {
  shop: RamenShop;
  isBookmarked: boolean;
  onToggleBookmark: (shop: RamenShop) => void;
  onOpenDetail: (shop: RamenShop) => void;
  userLat?: number;
  userLng?: number;
}

export const RamenCard: React.FC<RamenCardProps> = ({
  shop,
  isBookmarked,
  onToggleBookmark,
  onOpenDetail,
  userLat,
  userLng,
}) => {
  const [copied, setCopied] = useState(false);

  // Walking time approximation: ~80 meters per minute in Japan
  const distanceMeters = shop.distance_m ?? 0;
  const walkMinutes = Math.max(1, Math.round(distanceMeters / 80));

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    const addressToCopy = shop.address || `${shop.pref}${shop.city} ${shop.name}`;
    navigator.clipboard.writeText(addressToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoogleMapsDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${shop.name} ${shop.address || shop.city}`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${query}&destination_place_id=&travelmode=walking`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const primaryStyle = shop.keito?.[0] ? getStyleInfo(shop.keito[0]) : null;

  return (
    <article
      onClick={() => onOpenDetail(shop)}
      className="group relative bg-stone-900/90 hover:bg-stone-800/90 border border-stone-800/80 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl flex flex-col justify-between"
    >
      <div>
        {/* Top Row: Distance + Style Lineage + Bookmark */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Distance from User */}
            {shop.distance_m !== undefined && (
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Footprints className="w-3.5 h-3.5" />
                <span>{shop.distance_m < 1000 ? `${shop.distance_m}m` : `${(shop.distance_m / 1000).toFixed(1)}km`}</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  (~{walkMinutes} min walk)
                </span>
              </div>
            )}

            {/* Similarity Score for Vibe Search */}
            {shop.similarity !== undefined && (
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                <span>{Math.round(shop.similarity * 100)}% match</span>
              </div>
            )}

            {/* Specialist vs Neighborhood Diner */}
            {shop.shop_type === 'senmon' && (
              <span className="text-[10px] font-semibold text-stone-300 bg-stone-800 px-1.5 py-0.5 rounded">
                専門店 Specialist
              </span>
            )}
            {shop.shop_type === 'machichuka' && (
              <span className="text-[10px] font-semibold text-stone-300 bg-stone-800 px-1.5 py-0.5 rounded">
                町中華 Neighborhood Diner
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(shop);
            }}
            aria-label="Bookmark shop"
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Shop Japanese Name & Audited Romaji Name */}
        <div className="mb-2">
          <h3 className="text-base sm:text-lg font-bold text-stone-100 group-hover:text-amber-300 transition-colors tracking-tight flex items-center gap-1.5">
            {shop.name}
            {shop.chain && (
              <span className="text-[11px] font-normal text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {shop.chain}
              </span>
            )}
          </h3>
          {shop.name_en && (
            <p className="text-xs text-stone-400 font-medium">
              {shop.name_en}
            </p>
          )}
        </div>

        {/* Ramen Style tags (Keito) */}
        {shop.keito && shop.keito.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
            {shop.keito.map((k) => {
              const info = getStyleInfo(k);
              return (
                <span
                  key={k}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${info.badgeColor}`}
                >
                  {info.label_ja} · {info.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Nearest Train Station */}
        {shop.station && (
          <div className="flex items-center gap-1.5 text-xs text-stone-300 mb-2 bg-stone-950/40 p-2 rounded-lg border border-stone-800/60">
            <Train className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="font-semibold text-stone-200">
              {shop.station.name}駅
            </span>
            {shop.station.name_en && (
              <span className="text-stone-400 text-[11px]">
                ({shop.station.name_en} Stn)
              </span>
            )}
            <span className="text-stone-400 font-mono ml-auto text-[11px]">
              {shop.station.distance_meters}m away
            </span>
          </div>
        )}

        {/* Location & Payment metadata */}
        <div className="flex items-center justify-between text-xs text-stone-400 gap-2 mb-3">
          <div className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
            <span className="truncate">
              {shop.pref} {shop.city}
            </span>
          </div>

          {/* Payment Status */}
          {shop.payment && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {shop.payment.cash_only ? (
                <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                  <Coins className="w-3 h-3" /> 現金のみ (Cash only)
                </span>
              ) : shop.payment.card_accepted || shop.payment.state === 'cashless_ok' ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  <CreditCard className="w-3 h-3" /> キャッシュレスOK
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
        <button
          onClick={handleCopyAddress}
          className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-100 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          title="Copy Japanese Address for Taxi or Local Directions"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[11px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy Address</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGoogleMapsDirections}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Maps</span>
          </button>

          <button
            onClick={() => onOpenDetail(shop)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-sm"
          >
            <span>View</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
};

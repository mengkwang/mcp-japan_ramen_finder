import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Train, 
  Bookmark, 
  ExternalLink, 
  Copy, 
  Check, 
  Volume2, 
  ShieldCheck,
  Navigation,
  Sparkles,
  Compass,
  Store,
  CreditCard,
  Coins
} from 'lucide-react';
import { RamenShop } from '../types/ramen';
import { getStyleInfo } from '../data/ramenStyles';

interface RamenDetailModalProps {
  shop: RamenShop | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (shop: RamenShop) => void;
  userLat?: number;
  userLng?: number;
}

export const RamenDetailModal: React.FC<RamenDetailModalProps> = ({
  shop,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  userLat,
  userLng,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(false);

  if (!isOpen || !shop) return null;

  const handleCopyAddress = () => {
    const text = shop.address || `${shop.pref}${shop.city} ${shop.name}`;
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const speakJapanese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      setPlayingVoice(true);
      utterance.onend = () => setPlayingVoice(false);
      utterance.onerror = () => setPlayingVoice(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOpenGoogleMaps = () => {
    const destination = encodeURIComponent(`${shop.name} ${shop.address || ''}`);
    const origin = userLat && userLng ? `${userLat},${userLng}` : '';
    const url = origin 
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`
      : `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenAppleMaps = () => {
    const query = encodeURIComponent(`${shop.name} ${shop.address || ''}`);
    const url = `https://maps.apple.com/?q=${query}&ll=${shop.lat},${shop.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const walkMinutes = Math.max(1, Math.round((shop.distance_m ?? 0) / 80));

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-2xl max-h-[92vh] bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍜</span>
            <div className="text-xs font-mono text-stone-400">
              ID: <span className="text-amber-400">{shop.id}</span>
            </div>
            {shop.status === 'active' && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                <ShieldCheck className="w-3 h-3" /> Live & Open
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(shop)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-amber-500 text-stone-950 font-bold' 
                  : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
              title="Bookmark shop"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main Title & Pronunciation */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
                    {shop.name}
                  </h2>
                  {shop.chain && (
                    <span className="text-xs font-semibold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                      {shop.chain}
                    </span>
                  )}
                </div>
                {shop.name_en && (
                  <p className="text-sm text-stone-400 font-medium mt-0.5">
                    {shop.name_en}
                  </p>
                )}
              </div>

              {/* Japanese Pronunciation Speaker */}
              <button
                onClick={() => speakJapanese(shop.name)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all flex-shrink-0"
                title="Pronounce shop name in Japanese"
              >
                <Volume2 className={`w-4 h-4 ${playingVoice ? 'animate-bounce text-amber-400' : ''}`} />
                <span>Hear Voice</span>
              </button>
            </div>

            {/* Distance highlight */}
            {shop.distance_m !== undefined && (
              <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <Navigation className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong className="text-amber-200">
                    {shop.distance_m < 1000 ? `${shop.distance_m}m` : `${(shop.distance_m / 1000).toFixed(1)}km`} away
                  </strong>{' '}
                  from your selected location (~{walkMinutes} min walk)
                </span>
              </div>
            )}
          </div>

          {/* Ramen Style (Keito) Classification */}
          {shop.keito && shop.keito.length > 0 && (
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Ramen Lineage & Style (系統)
              </span>
              <div className="space-y-2">
                {shop.keito.map((k) => {
                  const styleInfo = getStyleInfo(k);
                  return (
                    <div key={k} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${styleInfo.badgeColor}`}>
                          {styleInfo.label_ja} · {styleInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">
                        {styleInfo.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Address & Train Station Access */}
          <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-3">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Location & Access (アクセス)
            </span>

            {/* Nearest Train Station */}
            {shop.station && (
              <div className="flex items-start gap-2.5 text-xs text-stone-200">
                <Train className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-100">
                    {shop.station.name}駅 ({shop.station.name_en || 'Station'})
                  </div>
                  <div className="text-stone-400 text-[11px] mt-0.5">
                    Approximately {shop.station.distance_meters} meters from station exit
                  </div>
                </div>
              </div>
            )}

            {/* Japanese Full Address */}
            <div className="flex items-start justify-between gap-2 pt-2 border-t border-stone-800/60">
              <div className="flex items-start gap-2.5 text-xs text-stone-300 min-w-0">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="font-mono text-stone-200 text-xs select-all">
                    {shop.address || `${shop.pref} ${shop.city}`}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {shop.pref_en || shop.pref} · {shop.city_en || shop.city}
                  </div>
                </div>
              </div>

              {/* Copy Address Button */}
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors flex-shrink-0"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy for Taxi</span>
                  </>
                )}
              </button>
            </div>

            {/* Coordinates Reference */}
            {shop.lat && shop.lng && (
              <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-400 font-mono">
                <Compass className="w-3.5 h-3.5 text-stone-500" />
                <span>GSI Geo: {shop.lat.toFixed(5)}, {shop.lng.toFixed(5)}</span>
              </div>
            )}
          </div>

          {/* Conditional Attributes only when adjudicated in dataset */}
          {(shop.shop_type || (shop.payment && (shop.payment.cash_only || shop.payment.card_accepted))) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shop.payment && (shop.payment.cash_only || shop.payment.card_accepted) && (
                <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                    <span>Payment Method</span>
                  </div>
                  {shop.payment.cash_only ? (
                    <div className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>現金のみ (Cash Only)</span>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>キャッシュレス対応 (Cards / IC Accepted)</span>
                    </div>
                  )}
                </div>
              )}

              {shop.shop_type && (
                <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-amber-500" />
                    <span>Classification</span>
                  </div>
                  <div className="text-xs text-stone-300">
                    {shop.shop_type === 'senmon' && 'ラーメン専門店 (Ramen Specialist)'}
                    {shop.shop_type === 'machichuka' && '町中華 (Neighborhood Chinese Diner)'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Japanese Ordering Helper Phrases */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Traveler Counter Phrases for this Store</span>
              </div>
              <span className="text-[10px] text-amber-400/80">Tap to hear audio</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {[
                { ja: 'おすすめをお願いします', romaji: 'Osusume o onegaishimasu', en: 'What is your signature bowl?' },
                { ja: '麺硬めでお願いします', romaji: 'Men katame de onegaishimasu', en: 'Firm noodles please' },
                { ja: '替え玉お願いします', romaji: 'Kaedama onegaishimasu', en: 'One noodle refill please' },
              ].map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => speakJapanese(phrase.ja)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-stone-950/60 hover:bg-stone-900 border border-amber-500/20 text-left transition-colors group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300">
                      {phrase.ja}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {phrase.romaji} · <span className="text-stone-300 font-normal">{phrase.en}</span>
                    </div>
                  </div>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleOpenGoogleMaps}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-all shadow-md active:scale-[0.99]"
          >
            <Navigation className="w-4 h-4" />
            <span>Open Google Maps Walking Route</span>
          </button>

          <button
            onClick={handleOpenAppleMaps}
            className="sm:w-auto flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Apple Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
};

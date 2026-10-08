import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Coins, 
  Volume2, 
  CheckCircle2, 
  Flame, 
  Sparkles,
  HelpCircle,
  Soup
} from 'lucide-react';

interface OrderingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderingGuideModal: React.FC<OrderingGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [playingText, setPlayingText] = useState<string | null>(null);

  if (!isOpen) return null;

  const playVoice = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      setPlayingText(text);
      utterance.onend = () => setPlayingText(null);
      utterance.onerror = () => setPlayingText(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-2xl max-h-[90vh] bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-stone-100">
                Japan Ramen Ordering Guide & Cheat Sheet
              </h2>
              <p className="text-[11px] text-stone-400">
                Essential traveler etiquette, ticket machines & counter phrases
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Step-by-Step Ticket Machine Guide */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Step 1: The Ticket Machine (食券機 Shokkenki)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">1</span>
                  <span>Insert Money First</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Always insert paper bills (¥1,000 bills) or coins <em>before</em> pressing buttons, or the buttons won't light up!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">2</span>
                  <span>Top-Left is Signature Bowl</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  In Japan, the top-left button (左上) is almost universally the chef's number one recommendation (看板メニュー).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">3</span>
                  <span>Push Change Button (おつり)</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Collect your change lever or button, then take your paper tickets and head to an open stool.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">4</span>
                  <span>Place Ticket on Counter</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Set tickets on the raised counter edge in front of you. The chef will pick them up immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Noodle Firmness Guide */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider">
              <Soup className="w-4 h-4 text-amber-500" />
              <span>Step 2: Noodle Firmness Levels (麺の硬さ)</span>
            </div>

            <p className="text-xs text-stone-400">
              When handing your ticket, especially at Tonkotsu and Iekei shops, the staff will ask: <em>"Men no katasa wa?"</em> (How would you like your noodles?).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { level: 'Barikata', ja: 'バリカタ', en: 'Extra Firm (Quick boil)', tag: 'Favorite in Hakata' },
                { level: 'Katame', ja: 'カタメ', en: 'Firm & Chewy', tag: 'Most Popular' },
                { level: 'Futsuu', ja: '普通', en: 'Standard / Regular', tag: 'Chef Default' },
                { level: 'Yawame', ja: 'ヤワメ', en: 'Soft & Tender', tag: 'Absorbs broth' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => playVoice(`${item.ja}でお願いします`)}
                  className="p-3 rounded-xl bg-stone-950/80 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/50 text-left transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-stone-100 group-hover:text-amber-400">
                      {item.ja}
                    </span>
                    <Volume2 className={`w-3.5 h-3.5 text-amber-500 ${playingText === `${item.ja}でお願いします` ? 'animate-bounce' : ''}`} />
                  </div>
                  <div className="text-xs font-semibold text-stone-300">
                    {item.level}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1">
                    {item.en}
                  </div>
                  <div className="text-[10px] text-amber-500 font-medium mt-1">
                    {item.tag}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Japanese Audio Phrases */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Audio Phrasebook: Tap to Speak to the Chef</span>
              </div>
            </div>

            <div className="space-y-2">
              {[
                {
                  ja: 'おすすめは何ですか？',
                  romaji: 'Osusume wa nan desu ka?',
                  en: 'What do you recommend here?',
                  context: 'Ask at ticket machine or counter',
                },
                {
                  ja: 'カタメでお願いします。',
                  romaji: 'Katame de onegaishimasu.',
                  en: 'Firm noodles, please.',
                  context: 'When handing over your ticket',
                },
                {
                  ja: '替え玉お願いします！',
                  romaji: 'Kaedama onegaishimasu!',
                  en: 'One noodle refill, please! (Keep broth in your bowl)',
                  context: 'Tonkotsu shops (usually ¥100~¥150 cash)',
                },
                {
                  ja: 'お冷をいただけますか？',
                  romaji: 'O-hiya o itadakemasu ka?',
                  en: 'Can I have some cold water, please?',
                  context: 'If self-service pitcher is empty',
                },
                {
                  ja: 'ティッシュはありますか？',
                  romaji: 'Tisshu wa arimasu ka?',
                  en: 'Do you have napkins / tissue paper?',
                  context: 'Often behind your seat on shelf',
                },
                {
                  ja: 'ごちそうさまでした！',
                  romaji: 'Gochisousama deshita!',
                  en: 'Thank you for the delicious meal!',
                  context: 'Say when leaving and placing bowl on top ledge',
                },
              ].map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between gap-3 group hover:border-amber-500/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-stone-100 flex items-center gap-2">
                      <span>{p.ja}</span>
                    </div>
                    <div className="text-xs text-amber-400/90 font-mono mt-0.5">
                      {p.romaji}
                    </div>
                    <div className="text-xs text-stone-300 mt-0.5">
                      {p.en}
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5 italic">
                      Tip: {p.context}
                    </div>
                  </div>

                  <button
                    onClick={() => playVoice(p.ja)}
                    className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 transition-all flex-shrink-0"
                    title="Play Japanese voice"
                  >
                    <Volume2 className={`w-4 h-4 ${playingText === p.ja ? 'animate-bounce text-amber-400' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Rules of Japanese Ramen Counters */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>3 Golden Rules of Japan Ramen Etiquette</span>
            </h4>
            <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside">
              <li><strong>Slurp your noodles:</strong> Slurping cools the piping noodles and aerates broth aromas into your palate. It is polite, not rude!</li>
              <li><strong>Eat while piping hot:</strong> Ramen loses noodle texture quickly; avoid lengthy phone browsing once the bowl is served.</li>
              <li><strong>Return bowl to top counter:</strong> When finished, wipe your counter spot with the rag (Fukin) and place your empty bowl on the top ledge.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
          >
            Got it, Let's Eat!
          </button>
        </div>
      </div>
    </div>
  );
};

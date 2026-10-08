import { RamenStyleDefinition } from '../types/ramen';

export const RAMEN_STYLES: RamenStyleDefinition[] = [
  {
    key: 'all',
    label: 'All Styles',
    label_ja: '全系統',
    description: 'Explore all ramen styles across Japan without filtering.',
    badgeColor: 'bg-stone-800 text-stone-200 border-stone-700',
    brothColor: '#78716c'
  },
  {
    key: 'tonkotsu',
    label: 'Tonkotsu',
    label_ja: '豚骨',
    description: 'Rich, creamy broth made by boiling pork marrow bones for 12+ hours. Signature of Hakata/Fukuoka.',
    badgeColor: 'bg-amber-950/80 text-amber-200 border-amber-800/60',
    brothColor: '#f59e0b'
  },
  {
    key: 'shoyu',
    label: 'Shoyu',
    label_ja: '醤油',
    description: 'The archetype of Japanese ramen: clear chicken, seafood, or pork broth seasoned with aged soy sauce.',
    badgeColor: 'bg-orange-950/80 text-orange-200 border-orange-800/60',
    brothColor: '#ea580c'
  },
  {
    key: 'miso',
    label: 'Miso',
    label_ja: '味噌',
    description: 'Hearty fermented soybean paste cooked with garlic, wok-fried sprouts, and rich stock. Originated in Sapporo.',
    badgeColor: 'bg-yellow-950/80 text-yellow-200 border-yellow-800/60',
    brothColor: '#eab308'
  },
  {
    key: 'shio',
    label: 'Shio',
    label_ja: '塩',
    description: 'Delicate, clear broth seasoned with mineral sea salt and kelp/niboshi. Highlights pure ingredient aroma.',
    badgeColor: 'bg-cyan-950/80 text-cyan-200 border-cyan-800/60',
    brothColor: '#06b6d4'
  },
  {
    key: 'tsukemen',
    label: 'Tsukemen',
    label_ja: 'つけ麺',
    description: 'Thick, cold-rinsed chewy noodles dipped into an ultra-concentrated, pipingly hot seafood & pork tare bowl.',
    badgeColor: 'bg-emerald-950/80 text-emerald-200 border-emerald-800/60',
    brothColor: '#10b981'
  },
  {
    key: 'iekei',
    label: 'Iekei (家系)',
    label_ja: '横浜家系',
    description: 'Yokohama style: emulsion of pork bone & dark shoyu topped with chicken oil (chiyu), spinach, and 3 nori sheets.',
    badgeColor: 'bg-red-950/80 text-red-200 border-red-800/60',
    brothColor: '#ef4444'
  },
  {
    key: 'jiro',
    label: 'Jiro-kei (二郎系)',
    label_ja: '二郎インスパイア',
    description: 'Massive portions, mountain of bean sprouts & cabbage, chopped raw garlic (niniku), back fat (abura), thick noodles.',
    badgeColor: 'bg-purple-950/80 text-purple-200 border-purple-800/60',
    brothColor: '#a855f7'
  },
  {
    key: 'tantanmen',
    label: 'Tantanmen',
    label_ja: '担々麺',
    description: 'Rich roasted sesame paste (shiba-ma-jiang), chili oil (ra-yu), and spiced ground pork. Warming and fragrant.',
    badgeColor: 'bg-rose-950/80 text-rose-200 border-rose-800/60',
    brothColor: '#f43f5e'
  },
  {
    key: 'abura_mazesoba',
    label: 'Abura Soba / Mazesoba',
    label_ja: '油そば・まぜそば',
    description: 'Soup-less noodles tossed with tare sauce, aromatic oil, vinegar, raw egg yolk, and savory minced pork.',
    badgeColor: 'bg-amber-900/60 text-amber-100 border-amber-700/60',
    brothColor: '#d97706'
  },
  {
    key: 'toripaitan',
    label: 'Tori Paitan',
    label_ja: '鶏白湯',
    description: 'Velvety, collagen-rich white soup extracted purely from simmered whole chickens and carcasses.',
    badgeColor: 'bg-lime-950/80 text-lime-200 border-lime-800/60',
    brothColor: '#84cc16'
  },
  {
    key: 'champon',
    label: 'Champon',
    label_ja: 'ちゃんぽん',
    description: 'Nagasaki heritage dish: thick noodles boiled directly in broth with seafood (squid, shrimp) and crisp vegetables.',
    badgeColor: 'bg-teal-950/80 text-teal-200 border-teal-800/60',
    brothColor: '#14b8a6'
  }
];

export function getStyleInfo(styleKey?: string): RamenStyleDefinition {
  if (!styleKey) return RAMEN_STYLES[0];
  const found = RAMEN_STYLES.find(
    (s) => s.key === styleKey || s.key.toLowerCase() === styleKey.toLowerCase()
  );
  if (found) return found;

  return {
    key: 'all',
    label: styleKey.charAt(0).toUpperCase() + styleKey.slice(1),
    label_ja: styleKey,
    description: 'Specialty ramen school in Japan',
    badgeColor: 'bg-stone-800 text-stone-200 border-stone-700',
    brothColor: '#f59e0b'
  };
}

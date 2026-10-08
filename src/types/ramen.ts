export interface RamenShop {
  id: string;
  name: string;
  name_en?: string;
  pref: string;
  pref_en?: string;
  city: string;
  city_en?: string;
  address?: string;
  lat: number;
  lng: number;
  keito?: string[];
  chain?: string | null;
  chain_sub?: string | null;
  shop_type?: 'senmon' | 'machichuka' | string | null;
  status?: 'active' | 'closed_candidate' | 'closed_confirmed';
  distance_m?: number;
  genre?: string;
  menu_signature?: string[];
  opened_on?: string;
  station?: {
    name: string;
    name_en?: string;
    distance_meters?: number;
  };
  payment?: {
    cash_only?: boolean;
    card_accepted?: boolean;
    qr_accepted?: boolean;
    state?: 'cashless_ok' | 'cash_only' | string;
  };
  sources?: string[];
  freshness?: {
    status?: string;
  };
  similarity?: number;
}

export interface TravelLocation {
  id: string;
  name: string;
  name_ja: string;
  region: string;
  prefecture: string;
  lat: number;
  lng: number;
  description: string;
}

export type RamenStyleKey =
  | 'all'
  | 'tonkotsu'
  | 'shoyu'
  | 'miso'
  | 'shio'
  | 'tsukemen'
  | 'iekei'
  | 'jiro'
  | 'tantanmen'
  | 'abura_mazesoba'
  | 'toripaitan'
  | 'champon';

export interface RamenStyleDefinition {
  key: RamenStyleKey;
  label: string;
  label_ja: string;
  description: string;
  badgeColor: string;
  brothColor: string;
}

export interface McpServerStatus {
  endpoint: string;
  provider: 'smithery' | 'live-engine';
  connected: boolean;
  latencyMs: number | null;
  totalMatched?: number;
  lastChecked: string;
  smitheryTokenConfigured: boolean;
  error?: string | null;
}

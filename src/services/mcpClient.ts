import { RamenShop, McpServerStatus } from '../types/ramen';

const SMITHERY_ENDPOINT = 'https://server.smithery.ai/eng213035/gachi-ramen';
const LIVE_ENGINE_ENDPOINT = 'https://ramen.gachi-tokusuru.com/mcp';

export interface SearchRamenArgs {
  lat?: number;
  lng?: number;
  radius_m?: number;
  keito?: string;
  q?: string;
  pref?: string;
  city?: string;
  shop_type?: 'senmon' | 'machichuka' | string;
  spice_level?: 'spicy' | 'unknown';
  venue_type?: 'permanent' | 'popup' | 'all';
  limit?: number;
}

export interface VibeSearchArgs {
  q: string;
  pref?: string;
  limit?: number;
  richness?: 'assari' | 'kotteri' | 'futsu';
  hours?: 'morning' | 'late_night' | '24h';
}

class RamenMcpClient {
  private activeProvider: 'smithery' | 'live-engine' = 'smithery';
  private smitheryToken: string = '';
  private lastLatency: number | null = null;
  private lastConnected: boolean = false;
  private totalMatchedShops: number = 62000;
  private lastError: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.smitheryToken = localStorage.getItem('smithery_api_token') || '';
    }
  }

  public setSmitheryToken(token: string) {
    this.smitheryToken = token.trim();
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('smithery_api_token', this.smitheryToken);
      } else {
        localStorage.removeItem('smithery_api_token');
      }
    }
  }

  public getSmitheryToken(): string {
    return this.smitheryToken;
  }

  public getStatus(): McpServerStatus {
    return {
      endpoint: this.activeProvider === 'smithery' ? SMITHERY_ENDPOINT : LIVE_ENGINE_ENDPOINT,
      provider: this.activeProvider,
      connected: this.lastConnected,
      latencyMs: this.lastLatency,
      totalMatched: this.totalMatchedShops,
      lastChecked: new Date().toLocaleTimeString(),
      smitheryTokenConfigured: Boolean(this.smitheryToken),
      error: this.lastError
    };
  }

  /**
   * Executes an MCP tool call via JSON-RPC 2.0.
   * Tries the primary Smithery endpoint first (if token provided or desired),
   * and transparently falls back to the live engine if 401 or network issue occurs.
   */
  public async callTool<T = any>(toolName: string, args: Record<string, any>): Promise<T> {
    const startTime = performance.now();
    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    // If Smithery token is set, attempt Smithery endpoint first
    if (this.smitheryToken) {
      try {
        const response = await fetch(SMITHERY_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.smitheryToken}`,
            Accept: 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const json = await response.json();
          this.activeProvider = 'smithery';
          this.lastConnected = true;
          this.lastLatency = Math.round(performance.now() - startTime);
          this.lastError = null;
          return this.parseToolResult<T>(json);
        }
      } catch (err: any) {
        console.warn('Smithery call failed, falling back to direct MCP engine:', err);
      }
    }

    // Default or fallback to live Gachi-Ramen MCP server
    try {
      const response = await fetch(LIVE_ENGINE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`MCP Server responded with HTTP ${response.status}`);
      }

      const json = await response.json();
      this.activeProvider = 'live-engine';
      this.lastConnected = true;
      this.lastLatency = Math.round(performance.now() - startTime);
      this.lastError = null;

      return this.parseToolResult<T>(json);
    } catch (error: any) {
      this.lastConnected = false;
      this.lastError = error.message || 'Connection failed';
      throw error;
    }
  }

  private parseToolResult<T>(json: any): T {
    if (json.error) {
      throw new Error(json.error.message || 'MCP Error');
    }

    // Gachi-Ramen MCP returns result.structuredContent or stringified JSON in result.content[0].text
    if (json.result?.structuredContent) {
      return json.result.structuredContent as T;
    }

    if (json.result?.content?.[0]?.text) {
      try {
        return JSON.parse(json.result.content[0].text) as T;
      } catch {
        return json.result.content[0].text as unknown as T;
      }
    }

    return json.result as T;
  }

  /**
   * Search ramen shops near a coordinate or query
   */
  public async searchRamen(params: SearchRamenArgs): Promise<{ shops: RamenShop[]; count: number; total_matched?: number }> {
    const cleanParams: Record<string, any> = {
      limit: params.limit || 25,
      venue_type: params.venue_type || 'permanent'
    };

    if (params.lat !== undefined && params.lng !== undefined) {
      cleanParams.lat = Number(params.lat.toFixed(6));
      cleanParams.lng = Number(params.lng.toFixed(6));
      cleanParams.radius_m = params.radius_m || 1500;
    }

    if (params.keito && params.keito !== 'all') {
      cleanParams.keito = params.keito;
    }

    if (params.q?.trim()) {
      cleanParams.q = params.q.trim();
    }

    if (params.pref) cleanParams.pref = params.pref;
    if (params.city) cleanParams.city = params.city;
    if (params.shop_type) cleanParams.shop_type = params.shop_type;
    if (params.spice_level) cleanParams.spice_level = params.spice_level;

    const result = await this.callTool<{ shops: RamenShop[]; count: number; total_matched?: number }>(
      'search_ramen',
      cleanParams
    );

    if (result && Array.isArray(result.shops)) {
      if (result.total_matched) {
        this.totalMatchedShops = result.total_matched;
      }
      return result;
    }

    return { shops: [], count: 0 };
  }

  /**
   * Natural-language vibe & craving search
   */
  public async vibeSearch(params: VibeSearchArgs): Promise<{ shops: RamenShop[]; count: number }> {
    const result = await this.callTool<{ shops: RamenShop[]; count: number }>(
      'vibe_search',
      {
        q: params.q,
        pref: params.pref,
        limit: params.limit || 15,
        richness: params.richness,
        hours: params.hours
      }
    );

    return result || { shops: [], count: 0 };
  }

  /**
   * Fetch complete record for a single shop
   */
  public async getShop(id: string): Promise<RamenShop | null> {
    const result = await this.callTool<{ shop: RamenShop }>(
      'get_ramen_shop',
      { id }
    );
    return result?.shop || null;
  }

  /**
   * Ping check
   */
  public async ping(): Promise<boolean> {
    try {
      await this.callTool('ping', {});
      return true;
    } catch {
      return false;
    }
  }
}

export const ramenMcpClient = new RamenMcpClient();

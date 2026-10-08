import { RamenShop, McpServerStatus } from '../types/ramen';

// MCP server configuration
export const MCP_CONFIG = {
  mcpServers: {
    'japan-ramen': {
      url: 'https://ramen.gachi-tokusuru.com/mcp'
    }
  }
};

const JAPAN_RAMEN_ENDPOINT = MCP_CONFIG.mcpServers['japan-ramen'].url;

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
  private serverName: string = 'japan-ramen';
  private endpoint: string = JAPAN_RAMEN_ENDPOINT;
  private lastLatency: number | null = null;
  private lastConnected: boolean = false;
  private totalMatchedShops: number = 62000;
  private lastError: string | null = null;

  public getStatus(): McpServerStatus {
    return {
      serverName: this.serverName,
      endpoint: this.endpoint,
      connected: this.lastConnected,
      latencyMs: this.lastLatency,
      totalMatched: this.totalMatchedShops,
      lastChecked: new Date().toLocaleTimeString(),
      error: this.lastError
    };
  }

  /**
   * Executes a tool call on the japan-ramen MCP server via JSON-RPC 2.0
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

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`japan-ramen MCP responded with HTTP ${response.status}`);
      }

      const json = await response.json();
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
   * Natural-language semantic craving search
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

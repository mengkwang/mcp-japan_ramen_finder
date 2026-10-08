import React, { useState } from 'react';
import { 
  X, 
  Server, 
  ShieldCheck, 
  RefreshCw,
  Database,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ramenMcpClient } from '../services/mcpClient';
import { McpServerStatus } from '../types/ramen';

interface McpStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: McpServerStatus;
  onRefreshStatus: () => void;
}

export const McpStatusModal: React.FC<McpStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
}) => {
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setPinging(true);
    setPingResult(null);
    const start = performance.now();
    try {
      await ramenMcpClient.ping();
      const elapsed = Math.round(performance.now() - start);
      setPingResult(`Success: Pong response in ${elapsed}ms`);
      onRefreshStatus();
    } catch (err: any) {
      setPingResult(`Ping failed: ${err.message}`);
    } finally {
      setPinging(false);
    }
  };

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
            <Server className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-stone-100">
                Gachi-Ramen MCP Connection (Free Tier)
              </h2>
              <p className="text-[11px] text-stone-400">
                Official No-Auth Free Service for 62,000+ Japanese Ramen Shops
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Active Free Tier Service Card */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Active Service Engine
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Free Tier Live & Connected
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-stone-400">Live Free-Tier Endpoint:</span>
                <span className="font-mono text-stone-200 break-all bg-stone-900 p-2 rounded border border-stone-800 select-all">
                  https://ramen.gachi-tokusuru.com/mcp
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-stone-900 p-2.5 rounded-lg border border-stone-800">
                  <div className="text-[10px] text-stone-400 uppercase">Service Plan</div>
                  <div className="text-xs font-bold text-amber-400">
                    Free Tier (No Auth)
                  </div>
                </div>

                <div className="bg-stone-900 p-2.5 rounded-lg border border-stone-800">
                  <div className="text-[10px] text-stone-400 uppercase">Latency</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {status.latencyMs !== null ? `${status.latencyMs} ms` : 'Active'}
                  </div>
                </div>
              </div>
            </div>

            {/* Test Ping Action */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleTestPing}
                disabled={pinging}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin text-amber-500' : ''}`} />
                <span>Test Live Ping</span>
              </button>

              {pingResult && (
                <span className="text-xs font-mono text-emerald-400">
                  {pingResult}
                </span>
              )}
            </div>
          </div>

          {/* Dataset Freshness & Coverage */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Database className="w-4 h-4 text-amber-500" />
              <span>Free Dataset Status & Coverage</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <div className="text-[10px] text-stone-400">Dataset Build</div>
                <div className="font-bold text-stone-200 font-mono">2026-09-26</div>
              </div>

              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <div className="text-[10px] text-stone-400">Total Store Records</div>
                <div className="font-bold text-amber-400 font-mono">62,000+ Nationwide</div>
              </div>

              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <div className="text-[10px] text-stone-400">Prefecture Coverage</div>
                <div className="font-bold text-stone-200">All 47 Prefectures</div>
              </div>

              <div className="p-2.5 rounded bg-stone-900 border border-stone-800">
                <div className="text-[10px] text-stone-400">Liveness Tracking</div>
                <div className="font-bold text-emerald-400">Monthly Re-crawl</div>
              </div>
            </div>
          </div>

          {/* Supported Free-Tier Tools */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Active Free Tools Available</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded bg-stone-900 border border-stone-800 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono font-bold text-stone-200">search_ramen</div>
                  <div className="text-stone-400 text-[11px]">
                    Geo-radius query by lat/lng, walking distance, keito lineage, and shop name matching.
                  </div>
                </div>
              </div>

              <div className="p-2 rounded bg-stone-900 border border-stone-800 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono font-bold text-stone-200">vibe_search</div>
                  <div className="text-stone-400 text-[11px]">
                    Semantic craving search via bge-m3 embeddings (English & Japanese food descriptors).
                  </div>
                </div>
              </div>

              <div className="p-2 rounded bg-stone-900 border border-stone-800 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono font-bold text-stone-200">get_ramen_shop</div>
                  <div className="text-stone-400 text-[11px]">
                    Lookup official address, nearest train station exit distance, and style taxonomy.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

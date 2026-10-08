import React, { useState } from 'react';
import { 
  X, 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Key, 
  ExternalLink, 
  RefreshCw,
  Database,
  Layers
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
  const [tokenInput, setTokenInput] = useState(ramenMcpClient.getSmitheryToken());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveToken = () => {
    ramenMcpClient.setSmitheryToken(tokenInput);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    onRefreshStatus();
  };

  const handleTestPing = async () => {
    setPinging(true);
    setPingResult(null);
    const start = performance.now();
    try {
      await ramenMcpClient.ping();
      const elapsed = Math.round(performance.now() - start);
      setPingResult(`Success: Pong received in ${elapsed}ms`);
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
                Gachi-Ramen MCP Connection Inspector
              </h2>
              <p className="text-[11px] text-stone-400">
                Nationwide 62,000+ Ramen Shops Protocol Endpoint
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
          {/* Active Status Card */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Connection Status
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                status.connected 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${status.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {status.connected ? 'Online & Ready' : 'Connecting'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-stone-400">Smithery Endpoint:</span>
                <span className="font-mono text-stone-200 break-all bg-stone-900 p-2 rounded border border-stone-800">
                  https://server.smithery.ai/eng213035/gachi-ramen
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-stone-400">Live Engine Fallback / Direct:</span>
                <span className="font-mono text-stone-200 break-all bg-stone-900 p-2 rounded border border-stone-800">
                  https://ramen.gachi-tokusuru.com/mcp
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-stone-900 p-2.5 rounded-lg border border-stone-800">
                  <div className="text-[10px] text-stone-400 uppercase">Provider Route</div>
                  <div className="text-xs font-bold text-amber-400 capitalize">
                    {status.provider === 'smithery' ? 'Smithery Proxy' : 'Live Gachi Engine'}
                  </div>
                </div>

                <div className="bg-stone-900 p-2.5 rounded-lg border border-stone-800">
                  <div className="text-[10px] text-stone-400 uppercase">Response Latency</div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {status.latencyMs !== null ? `${status.latencyMs} ms` : 'Testing...'}
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
                <span>Test MCP Ping</span>
              </button>

              {pingResult && (
                <span className="text-xs font-mono text-emerald-400">
                  {pingResult}
                </span>
              )}
            </div>
          </div>

          {/* MCP Tools Available */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Registered MCP Tools</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded bg-stone-900 border border-stone-800">
                <div className="font-mono font-bold text-stone-200">tools/call : search_ramen</div>
                <div className="text-stone-400 text-[11px]">
                  Geo-radius search by lat/lng, keito lineage, prefecture, city, and shop name substring.
                </div>
              </div>

              <div className="p-2 rounded bg-stone-900 border border-stone-800">
                <div className="font-mono font-bold text-stone-200">tools/call : vibe_search</div>
                <div className="text-stone-400 text-[11px]">
                  Semantic craving search via bge-m3 embeddings ("rich creamy pork", "yuzu shio", "spicy tantanmen").
                </div>
              </div>

              <div className="p-2 rounded bg-stone-900 border border-stone-800">
                <div className="font-mono font-bold text-stone-200">tools/call : get_ramen_shop</div>
                <div className="text-stone-400 text-[11px]">
                  Lookup complete shop profile with menu signatures, nearest station, and payment methods.
                </div>
              </div>
            </div>
          </div>

          {/* Optional Smithery API Key Input */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-300 uppercase tracking-wider">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Smithery Bearer Token (Optional)</span>
              </div>
            </div>
            <p className="text-xs text-stone-400">
              If you have a personal Smithery authorization token, enter it here. Otherwise, the app automatically connects seamlessly to the live Gachi-Ramen engine.
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Bearer token (e.g. sm_live_...)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                onClick={handleSaveToken}
                className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
              >
                {saveSuccess ? 'Saved!' : 'Save'}
              </button>
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

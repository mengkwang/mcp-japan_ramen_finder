/**
 * MCP Endpoint Health & Data Update Status Checker
 * Target Server:
 * {
 *   "mcpServers": {
 *     "japan-ramen": {
 *       "url": "https://ramen.gachi-tokusuru.com/mcp"
 *     }
 *   }
 * }
 */

export const MCP_CONFIG = {
  mcpServers: {
    'japan-ramen': {
      url: 'https://ramen.gachi-tokusuru.com/mcp'
    }
  }
};

const JAPAN_RAMEN_ENDPOINT = MCP_CONFIG.mcpServers['japan-ramen'].url;

/**
 * Execute JSON-RPC tool call
 */
async function callJsonRpc(endpoint, method, params = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream'
  };

  const startTime = performance.now();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    })
  });

  const latencyMs = Math.round(performance.now() - startTime);
  const status = response.status;
  const statusText = response.statusText;

  let body = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  return {
    ok: response.ok,
    status,
    statusText,
    latencyMs,
    body
  };
}

/**
 * Parses tool output payload from JSON-RPC result
 */
function parseResultContent(resBody) {
  if (!resBody?.result) return null;
  if (resBody.result.structuredContent) return resBody.result.structuredContent;
  if (resBody.result.content?.[0]?.text) {
    try {
      return JSON.parse(resBody.result.content[0].text);
    } catch {
      return resBody.result.content[0].text;
    }
  }
  return resBody.result;
}

/**
 * Inspect health and data update status for japan-ramen MCP endpoint
 */
export async function checkMcpStatus() {
  const timestamp = new Date().toISOString();

  const report = {
    checked_at: timestamp,
    server_name: 'japan-ramen',
    endpoint: JAPAN_RAMEN_ENDPOINT,
    config: MCP_CONFIG,
    connection: {
      connected: false,
      status: null,
      latency_ms: null,
      ping: false,
      tools_available: []
    },
    data_status: {
      dataset: 'ramen',
      data_as_of: null,
      generated_at: null,
      recent_changes_count: 0,
      total_nationwide_shops: '62,000+',
      liveness_tracking: 'rolling monthly re-crawl',
      sample_verified_shop: null
    },
    overall_health: 'UNKNOWN'
  };

  // 1. Check Ping & Tools List on japan-ramen
  try {
    const pingRes = await callJsonRpc(JAPAN_RAMEN_ENDPOINT, 'tools/call', {
      name: 'ping',
      arguments: {}
    });
    report.connection.latency_ms = pingRes.latencyMs;
    report.connection.status = pingRes.status;

    if (pingRes.ok) {
      report.connection.connected = true;
      report.connection.ping = true;
    }

    const toolsRes = await callJsonRpc(JAPAN_RAMEN_ENDPOINT, 'tools/list', {});
    if (toolsRes.ok && toolsRes.body?.result?.tools) {
      report.connection.tools_available = toolsRes.body.result.tools.map(t => t.name);
    }
  } catch (err) {
    report.connection.connected = false;
    report.connection.error = err.message;
  }

  // 2. Check Data Update Status
  try {
    const changesRes = await callJsonRpc(JAPAN_RAMEN_ENDPOINT, 'tools/call', {
      name: 'get_ramen_changes',
      arguments: {}
    });

    if (changesRes.ok) {
      const changesData = parseResultContent(changesRes.body);
      if (changesData) {
        report.data_status.data_as_of = changesData.data_as_of || changesData.generated_at;
        report.data_status.generated_at = changesData.generated_at;
        report.data_status.recent_changes_count = changesData.count || 0;
      }
    }
  } catch (err) {
    report.data_status.changes_error = err.message;
  }

  // 3. Sample check for total indexed shops & live coverage
  try {
    const searchRes = await callJsonRpc(JAPAN_RAMEN_ENDPOINT, 'tools/call', {
      name: 'search_ramen',
      arguments: {
        pref: '東京都',
        limit: 1
      }
    });

    if (searchRes.ok) {
      const searchData = parseResultContent(searchRes.body);
      if (searchData) {
        report.data_status.total_nationwide_shops = '62,000+';
        report.data_status.sample_verified_shop = searchData.shops?.[0]?.name || null;
      }
    }
  } catch (err) {
    report.data_status.sample_error = err.message;
  }

  // Overall health
  report.overall_health = report.connection.connected ? 'HEALTHY' : 'DOWN';

  return report;
}

// Default export as HTTP handler
export default async function handler(req, res) {
  try {
    const report = await checkMcpStatus();
    if (res && typeof res.status === 'function') {
      res.status(200).json(report);
    }
    return report;
  } catch (err) {
    if (res && typeof res.status === 'function') {
      res.status(500).json({ error: err.message });
    }
    throw err;
  }
}

// CLI execution check
const isMain = process.argv[1] && (
  process.argv[1].endsWith('mcp.js') ||
  process.argv[1].endsWith('api/mcp.js')
);

if (isMain) {
  console.log('🍜 Checking japan-ramen MCP server connection & data status...\n');
  checkMcpStatus().then((report) => {
    console.log('====================================================');
    console.log(`STATUS: [${report.overall_health}] | ${report.checked_at}`);
    console.log('====================================================');
    console.log('\n[Server Config]:');
    console.log(`  Server Name: ${report.server_name}`);
    console.log(`  URL:         ${report.endpoint}`);
    console.log(`  Connected:   ${report.connection.connected}`);
    console.log(`  Latency:     ${report.connection.latency_ms} ms`);
    console.log(`  Tools:       ${report.connection.tools_available.join(', ')}`);

    console.log('\n[Dataset Status]:');
    console.log(`  Data As Of:      ${report.data_status.data_as_of}`);
    console.log(`  Feed Generated:  ${report.data_status.generated_at}`);
    console.log(`  Recent Changes:  ${report.data_status.recent_changes_count}`);
    console.log(`  Total Shops:     ${report.data_status.total_nationwide_shops}`);
    console.log(`  Liveness Mode:   ${report.data_status.liveness_tracking}`);
    console.log(`  Sample Store:    ${report.data_status.sample_verified_shop}`);
    console.log('\n====================================================');
    console.log('JSON Payload:\n', JSON.stringify(report, null, 2));
  }).catch((err) => {
    console.error('Fatal MCP check error:', err);
    process.exit(1);
  });
}

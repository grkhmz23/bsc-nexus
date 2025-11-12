import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { config } from '../config/env.js';

export const register = new Registry();

// RPC Request Metrics
export const rpcRequestCounter = new Counter({
  name: 'bsc_nexus_rpc_requests_total',
  help: 'Total number of RPC requests',
  labelNames: ['method', 'status'],
  registers: [register],
});

export const rpcRequestDuration = new Histogram({
  name: 'bsc_nexus_rpc_request_duration_seconds',
  help: 'RPC request duration in seconds',
  labelNames: ['method'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Anti-MEV Metrics
export const antiMevRelayCounter = new Counter({
  name: 'bsc_nexus_anti_mev_relay_submissions_total',
  help: 'Total transactions sent via private relay',
  registers: [register],
});

export const antiMevRelayFailures = new Counter({
  name: 'bsc_nexus_anti_mev_relay_failures_total',
  help: 'Total private relay failures',
  registers: [register],
});

export const antiMevFallbackCounter = new Counter({
  name: 'bsc_nexus_anti_mev_fallback_submissions_total',
  help: 'Total transactions sent via public fallback',
  registers: [register],
});

// API Key Metrics
export const apiKeyRequestCounter = new Counter({
  name: 'bsc_nexus_api_key_requests_total',
  help: 'Total requests per API key',
  labelNames: ['key_name'],
  registers: [register],
});

export const unauthorizedRequestCounter = new Counter({
  name: 'bsc_nexus_unauthorized_requests_total',
  help: 'Total unauthorized requests',
  labelNames: ['type'],
  registers: [register],
});

// System Metrics
export const activeConnectionsGauge = new Gauge({
  name: 'bsc_nexus_active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// Token Cache Metrics
export const tokenCacheHits = new Counter({
  name: 'bsc_nexus_token_cache_hits_total',
  help: 'Total token cache hits',
  registers: [register],
});

export const tokenCacheMisses = new Counter({
  name: 'bsc_nexus_token_cache_misses_total',
  help: 'Total token cache misses',
  registers: [register],
});

/**
 * Get all metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Reset all metrics (for testing)
 */
export function resetMetrics(): void {
  register.resetMetrics();
}

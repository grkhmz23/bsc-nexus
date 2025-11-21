import 'dotenv/config';

export interface ServerConfig {
  // Server
  port: number;
  nodeEnv: string;

  // RPC
  upstreamRpcUrl: string;
  upstreamRpcUrls: string[];
  rpcRequestTimeoutMs: number;
  rpcBackoffBaseMs: number;
  rpcBackoffMaxMs: number;

  // Anti-MEV
  antiMevEnabled: boolean;
  privateRelayUrl?: string;
  antiMevRandomDelayMin: number;
  antiMevRandomDelayMax: number;
  antiMevHardFailOnRelayError: boolean;
  
  // Security
  adminToken: string;
  
  // Database
  databaseUrl?: string;
  
  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  defaultRateLimitPerMinute: number;
  rateLimitBurstFactor: number;
  
  // WebSocket
  wsEnabled: boolean;
  
  // Monitoring
  metricsEnabled: boolean;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseFloatNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function loadConfig(): ServerConfig {
  // Validate required variables
  const upstreamRpcUrl =
    process.env.BSC_PRIMARY_RPC_URL ||
    process.env.UPSTREAM_RPC_URL ||
    process.env.BSC_RPC_URL ||
    'https://bsc-dataseed.binance.org';
  const expressRateLimitMax = parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100);
  const defaultPerMinute = parseNumber(process.env.DEFAULT_RATE_LIMIT_PER_MINUTE, expressRateLimitMax);
  const rpcTimeout = parseNumber(process.env.RPC_REQUEST_TIMEOUT_MS || process.env.BSC_RPC_TIMEOUT_MS, 15000);
  const rpcBackoffBase = parseNumber(process.env.RPC_BACKOFF_BASE_MS, 500);
  const rpcBackoffMax = parseNumber(process.env.RPC_BACKOFF_MAX_MS, 30000);

  const fallbackRpcs = process.env.BSC_FALLBACK_RPC_URLS || process.env.PUBLIC_RPC_FALLBACKS;

  const config: ServerConfig = {
    // Server
    port: parseNumber(process.env.PORT, 3000),
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // RPC
    upstreamRpcUrl,
    upstreamRpcUrls: fallbackRpcs
      ? [upstreamRpcUrl, ...fallbackRpcs.split(',').map(s => s.trim()).filter(Boolean)]
      : [upstreamRpcUrl],
    rpcRequestTimeoutMs: rpcTimeout,
    rpcBackoffBaseMs: rpcBackoffBase,
    rpcBackoffMaxMs: rpcBackoffMax,

    // Anti-MEV
    antiMevEnabled: parseBoolean(process.env.ENABLE_MEV_PROTECTION || process.env.ANTI_MEV_ENABLED, false),
    privateRelayUrl: process.env.PRIVATE_RELAY_URL,
    antiMevRandomDelayMin: parseNumber(process.env.ANTI_MEV_RANDOM_DELAY_MS_MIN, 20),
    antiMevRandomDelayMax: parseNumber(process.env.ANTI_MEV_RANDOM_DELAY_MS_MAX, 120),
    antiMevHardFailOnRelayError: parseBoolean(process.env.ANTI_MEV_HARD_FAIL_ON_RELAY_ERROR, false),
    
    // Security
    adminToken: process.env.ADMIN_TOKEN || 'change-me-in-production',
    
    // Database
    databaseUrl: process.env.DATABASE_URL,
    
    // Rate Limiting
    rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000), // 1 minute
    rateLimitMaxRequests: expressRateLimitMax,
    defaultRateLimitPerMinute: defaultPerMinute,
    rateLimitBurstFactor: parseFloatNumber(process.env.RATE_LIMIT_BURST_FACTOR, 1),
    
    // WebSocket
    wsEnabled: parseBoolean(process.env.WS_ENABLED, true),
    
    // Monitoring
    metricsEnabled: parseBoolean(process.env.METRICS_ENABLED, true),
  };
  
  // Warnings for development
  // Warnings for development
  if (config.nodeEnv === 'production') {
    if (config.adminToken === 'change-me-in-production') {
      console.warn('⚠️  WARNING: Using default ADMIN_TOKEN in production!');
    }
    if (!config.databaseUrl) {

      console.warn('⚠️  WARNING: DATABASE_URL not set. Database features disabled.');
    }
  }
  
  return config;
}

export const config = loadConfig();

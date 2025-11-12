import 'dotenv/config';

export interface ServerConfig {
  // Server
  port: number;
  nodeEnv: string;
  
  // RPC
  upstreamRpcUrl: string;
  upstreamRpcUrls: string[];
  
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

export function loadConfig(): ServerConfig {
  // Validate required variables
  const upstreamRpcUrl = process.env.UPSTREAM_RPC_URL || process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org';
  
  const config: ServerConfig = {
    // Server
    port: parseNumber(process.env.PORT, 3000),
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // RPC
    upstreamRpcUrl,
    upstreamRpcUrls: process.env.PUBLIC_RPC_FALLBACKS
      ? process.env.PUBLIC_RPC_FALLBACKS.split(',').map(s => s.trim()).filter(Boolean)
      : [upstreamRpcUrl],
    
    // Anti-MEV
    antiMevEnabled: parseBoolean(process.env.ANTI_MEV_ENABLED, false),
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
    rateLimitMaxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
    
    // WebSocket
    wsEnabled: parseBoolean(process.env.WS_ENABLED, true),
    
    // Monitoring
    metricsEnabled: parseBoolean(process.env.METRICS_ENABLED, true),
  };
  
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

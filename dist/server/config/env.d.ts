import 'dotenv/config';
export interface ServerConfig {
    port: number;
    nodeEnv: string;
    upstreamRpcUrl: string;
    upstreamRpcUrls: string[];
    antiMevEnabled: boolean;
    privateRelayUrl?: string;
    antiMevRandomDelayMin: number;
    antiMevRandomDelayMax: number;
    antiMevHardFailOnRelayError: boolean;
    adminToken: string;
    databaseUrl?: string;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    wsEnabled: boolean;
    metricsEnabled: boolean;
}
export declare function loadConfig(): ServerConfig;
export declare const config: ServerConfig;
//# sourceMappingURL=env.d.ts.map
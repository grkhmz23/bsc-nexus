import { Registry, Counter, Histogram, Gauge } from 'prom-client';
export declare const register: Registry<"text/plain; version=0.0.4; charset=utf-8">;
export declare const rpcRequestCounter: Counter<"method" | "status">;
export declare const rpcRequestDuration: Histogram<"method">;
export declare const antiMevRelayCounter: Counter<string>;
export declare const antiMevRelayFailures: Counter<string>;
export declare const antiMevFallbackCounter: Counter<string>;
export declare const apiKeyRequestCounter: Counter<"key_name">;
export declare const unauthorizedRequestCounter: Counter<"type">;
export declare const activeConnectionsGauge: Gauge<string>;
export declare const tokenCacheHits: Counter<string>;
export declare const tokenCacheMisses: Counter<string>;
/**
 * Get all metrics in Prometheus format
 */
export declare function getMetrics(): Promise<string>;
/**
 * Reset all metrics (for testing)
 */
export declare function resetMetrics(): void;
//# sourceMappingURL=metrics.d.ts.map
import { PrismaClientType } from '../db/prisma.js';
export interface ApiUsageRecord {
    id: string;
    apiKeyId: string;
    endpoint: string;
    method?: string | null;
    statusCode: number;
    latencyMs: number;
    timestamp: Date;
}
export interface UsageSummary {
    apiKeyId: string;
    totalRequests: number;
    averageLatencyMs: number | null;
    errorRate: number;
}
export declare function setPrismaClient(client: PrismaClientType): void;
export declare function logApiUsage(entry: Omit<ApiUsageRecord, 'id'>): Promise<void>;
export interface UsageQuery {
    apiKeyId?: string;
    from?: Date;
    to?: Date;
}
export declare function getUsageSummary(query?: UsageQuery): Promise<UsageSummary[]>;
//# sourceMappingURL=usageService.d.ts.map
import { prisma as defaultPrisma, PrismaClientType } from '../db/prisma.js';
import { logger } from '../config/logger.js';
type UsageGroup = {
  apiKeyId: string;
  _count: { _all: number };
  _avg: { latencyMs: number | null };
};

type ErrorGroup = {
  apiKeyId: string;
  _count: { _all: number };
};

let prisma: PrismaClientType = defaultPrisma;

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

export interface RecentUsageQuery {
  limit?: number;
  apiKeyId?: string;
  since?: Date;
  statusCodeGte?: number;
}

export function setPrismaClient(client: PrismaClientType): void {
  prisma = client;
}

export async function logApiUsage(entry: Omit<ApiUsageRecord, 'id'>): Promise<void> {
  try {
    await prisma.apiUsage.create({ data: entry });
  } catch (error) {
    logger.error('Failed to log API usage', { error });
  }
}

export interface UsageQuery {
  apiKeyId?: string;
  from?: Date;
  to?: Date;
}

export async function getUsageSummary(query: UsageQuery = {}): Promise<UsageSummary[]> {
  const where: any = {
    ...(query.apiKeyId ? { apiKeyId: query.apiKeyId } : {}),
    ...(query.from || query.to
      ? {
          timestamp: {
            ...(query.from ? { gte: query.from } : {}),
            ...(query.to ? { lte: query.to } : {}),
          },
        }
      : {}),
  };

  const grouped: UsageGroup[] = await prisma.apiUsage.groupBy({
    by: ['apiKeyId'],
    where,
    _count: { _all: true },
    _avg: { latencyMs: true },
  });

   const errorCounts: ErrorGroup[] = await prisma.apiUsage.groupBy({
    by: ['apiKeyId'],
    where: { ...where, statusCode: { gte: 400 } },
    _count: { _all: true },
  });

  const errorLookup = new Map<string, number>();
  for (const group of errorCounts) {
    errorLookup.set(group.apiKeyId, group._count._all);
  }

  return grouped.map(group => {
    const total = group._count._all;
    const errors = errorLookup.get(group.apiKeyId) || 0;

    return {
      apiKeyId: group.apiKeyId,
      totalRequests: total,
      averageLatencyMs: group._avg.latencyMs,
      errorRate: total > 0 ? errors / total : 0,
    };
  });
}

export async function getRecentUsage(query: RecentUsageQuery = {}): Promise<ApiUsageRecord[]> {
  const where: any = {
    ...(query.apiKeyId ? { apiKeyId: query.apiKeyId } : {}),
    ...(query.since ? { timestamp: { gte: query.since } } : {}),
    ...(query.statusCodeGte ? { statusCode: { gte: query.statusCodeGte } } : {}),
  };

  return prisma.apiUsage.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: query.limit ?? 50,
  });
}

export async function getRecentErrors(query: RecentUsageQuery = {}): Promise<ApiUsageRecord[]> {
  return getRecentUsage({
    ...query,
    statusCodeGte: Math.max(query.statusCodeGte ?? 400, 400),
  });
}
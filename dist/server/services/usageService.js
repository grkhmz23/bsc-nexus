import { prisma as defaultPrisma } from '../db/prisma.js';
import { logger } from '../config/logger.js';
let prisma = defaultPrisma;
export function setPrismaClient(client) {
    prisma = client;
}
export async function logApiUsage(entry) {
    try {
        await prisma.apiUsage.create({ data: entry });
    }
    catch (error) {
        logger.error('Failed to log API usage', { error });
    }
}
export async function getUsageSummary(query = {}) {
    const where = {
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
    const grouped = (await prisma.apiUsage.groupBy({
        by: ['apiKeyId'],
        where,
        _count: { _all: true },
        _avg: { latencyMs: true },
    }));
    const errorCounts = (await prisma.apiUsage.groupBy({
        by: ['apiKeyId'],
        where: { ...where, statusCode: { gte: 400 } },
        _count: { _all: true },
    }));
    const errorLookup = new Map();
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
export async function getRecentUsage(query = {}) {
    const where = {
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
export async function getRecentErrors(query = {}) {
    return getRecentUsage({
        ...query,
        statusCodeGte: Math.max(query.statusCodeGte ?? 400, 400),
    });
}

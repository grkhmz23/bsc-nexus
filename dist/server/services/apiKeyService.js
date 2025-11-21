import crypto from 'crypto';
import { prisma as defaultPrisma } from '../db/prisma.js';
import { logger } from '../config/logger.js';
let prisma = defaultPrisma;
export function setPrismaClient(client) {
    prisma = client;
}
export async function getApiKeyByValue(keyValue) {
    return prisma.apiKey.findUnique({
        where: { key: keyValue },
    });
}
export async function getApiKeyById(id) {
    return prisma.apiKey.findUnique({
        where: { id },
    });
}
export async function createApiKey(params) {
    const apiKeyValue = crypto.randomBytes(32).toString('hex');
    const apiKey = await prisma.apiKey.create({
        data: {
            key: apiKeyValue,
            label: params.label,
            tenantId: params.tenantId,
            rateLimitPerMinute: params.rateLimitPerMinute,
        },
    });
    logger.info('API key created', {
        tenantId: params.tenantId,
        label: params.label,
        id: apiKey.id,
    });
    return apiKey;
}
export async function listApiKeys() {
    return prisma.apiKey.findMany({
        orderBy: { createdAt: 'desc' },
    });
}
export async function deactivateApiKey(id) {
    await prisma.apiKey.update({
        where: { id },
        data: { isActive: false },
    });
}
export async function rotateApiKey(id) {
    const newKeyValue = crypto.randomBytes(32).toString('hex');
    const apiKey = await prisma.apiKey.update({
        where: { id },
        data: { key: newKeyValue },
    });
    logger.info('API key rotated', { id });
    return apiKey;
}

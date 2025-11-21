import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
const WINDOW_MS = 60_000;
const rateLimitBuckets = new Map();
function normalizeLimit(limit) {
    const burstFactor = limit.burstFactor && limit.burstFactor > 0 ? limit.burstFactor : 1;
    const max = limit.maxRequestsPerMinute > 0 ? limit.maxRequestsPerMinute : config.defaultRateLimitPerMinute;
    return {
        maxRequestsPerMinute: max,
        burstFactor,
    };
}
function bucketKey(apiKeyId) {
    return apiKeyId;
}
function getWindowStart(now) {
    return Math.floor(now / WINDOW_MS) * WINDOW_MS;
}
function getOrCreateBucket(apiKeyId, now) {
    const key = bucketKey(apiKeyId);
    const windowStart = getWindowStart(now);
    const existing = rateLimitBuckets.get(key);
    if (!existing || existing.windowStart !== windowStart) {
        const bucket = { windowStart, count: 0 };
        rateLimitBuckets.set(key, bucket);
        return bucket;
    }
    return existing;
}
export function getEffectiveLimitForApiKey(apiKey) {
    const perMinute = apiKey?.rateLimitPerMinute ?? config.defaultRateLimitPerMinute;
    return normalizeLimit({
        maxRequestsPerMinute: perMinute,
        burstFactor: config.rateLimitBurstFactor,
    });
}
function getMaxRequests(limit) {
    const normalized = normalizeLimit(limit);
    const burstMultiplier = normalized.burstFactor ?? 1;
    const rawMax = normalized.maxRequestsPerMinute * burstMultiplier;
    return Math.max(1, Math.ceil(rawMax));
}
export function checkAndConsume(apiKeyId, limit, now = Date.now()) {
    const bucket = getOrCreateBucket(apiKeyId, now);
    const maxRequests = getMaxRequests(limit);
    const resetAt = new Date(bucket.windowStart + WINDOW_MS);
    if (bucket.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt,
            currentCount: bucket.count,
        };
    }
    bucket.count += 1;
    const remaining = Math.max(0, maxRequests - bucket.count);
    return {
        allowed: true,
        remaining,
        resetAt,
        currentCount: bucket.count,
    };
}
export function getUsageSnapshot(apiKeyId, limit, now = Date.now()) {
    const bucket = getOrCreateBucket(apiKeyId, now);
    const maxRequests = getMaxRequests(limit);
    const resetAt = new Date(bucket.windowStart + WINDOW_MS);
    return {
        allowed: bucket.count < maxRequests,
        remaining: Math.max(0, maxRequests - bucket.count),
        resetAt,
        currentCount: bucket.count,
    };
}
export function resetRateLimitState() {
    rateLimitBuckets.clear();
    logger.info('Rate limit state reset');
}

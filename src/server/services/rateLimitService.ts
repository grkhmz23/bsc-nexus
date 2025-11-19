import { config } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiKeyRecord } from './apiKeyService.js';

export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  burstFactor?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  currentCount: number;
}

interface RateLimitBucket {
  windowStart: number;
  count: number;
}

const WINDOW_MS = 60_000;
const rateLimitBuckets = new Map<string, RateLimitBucket>();

function normalizeLimit(limit: RateLimitConfig): RateLimitConfig {
  const burstFactor = limit.burstFactor && limit.burstFactor > 0 ? limit.burstFactor : 1;
  const max = limit.maxRequestsPerMinute > 0 ? limit.maxRequestsPerMinute : config.defaultRateLimitPerMinute;
  return {
    maxRequestsPerMinute: max,
    burstFactor,
  };
}

function bucketKey(apiKeyId: string): string {
  return apiKeyId;
}

function getWindowStart(now: number): number {
  return Math.floor(now / WINDOW_MS) * WINDOW_MS;
}

function getOrCreateBucket(apiKeyId: string, now: number): RateLimitBucket {
  const key = bucketKey(apiKeyId);
  const windowStart = getWindowStart(now);
  const existing = rateLimitBuckets.get(key);

  if (!existing || existing.windowStart !== windowStart) {
    const bucket: RateLimitBucket = { windowStart, count: 0 };
    rateLimitBuckets.set(key, bucket);
    return bucket;
  }

  return existing;
}

export function getEffectiveLimitForApiKey(apiKey: ApiKeyRecord | undefined | null): RateLimitConfig {
  const perMinute = apiKey?.rateLimitPerMinute ?? config.defaultRateLimitPerMinute;
  return normalizeLimit({
    maxRequestsPerMinute: perMinute,
    burstFactor: config.rateLimitBurstFactor,
  });
}

function getMaxRequests(limit: RateLimitConfig): number {
  const normalized = normalizeLimit(limit);
  const burstMultiplier = normalized.burstFactor ?? 1;
  const rawMax = normalized.maxRequestsPerMinute * burstMultiplier;
  return Math.max(1, Math.ceil(rawMax));
}

export function checkAndConsume(apiKeyId: string, limit: RateLimitConfig, now = Date.now()): RateLimitResult {
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

export function getUsageSnapshot(apiKeyId: string, limit: RateLimitConfig, now = Date.now()): RateLimitResult {
  const bucket = getOrCreateBucket(apiKeyId, now);
  const maxRequests = getMaxRequests(limit);
  const resetAt = new Date(bucket.windowStart + WINDOW_MS);
  const remaining = Math.max(0, maxRequests - bucket.count);

  return {
    allowed: bucket.count < maxRequests,
    remaining,
    resetAt,
    currentCount: bucket.count,
  };
}

export function resetRateLimitState(): void {
  rateLimitBuckets.clear();
}

process.on('exit', () => {
  if (rateLimitBuckets.size > 0) {
    logger.debug('Clearing rate limit buckets on process exit');
    rateLimitBuckets.clear();
  }
});

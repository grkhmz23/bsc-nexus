import { Router, Request, Response } from 'express';
import { requireAdminToken } from '../middleware/auth.js';
import { logger } from '../config/logger.js';
import { createApiKey, listApiKeys, deactivateApiKey, getApiKeyById } from '../services/apiKeyService.js';
import { getUsageSummary, getRecentUsage, getRecentErrors } from '../services/usageService.js';
import { getEffectiveLimitForApiKey, getUsageSnapshot } from '../services/rateLimitService.js';

const router = Router();

/**
 * GET /admin/api-keys - List all API keys
 */
router.get('/api-keys', requireAdminToken, async (_req: Request, res: Response) => {
  try {
    const keys = await listApiKeys();

    logger.info('Admin: Listed API keys', {
      count: keys.length,
    });

    res.json({
      keys: keys.map((k: any) => ({
        id: k.id,
        key: k.key,
        label: k.label,
        tenantId: k.tenantId,
        isActive: k.isActive,
        rateLimitPerMinute: k.rateLimitPerMinute,
        createdAt: k.createdAt,
      })),
    });
  } catch (error: any) {
    logger.error('Failed to list API keys', { error: error.message });
    res.status(500).json({
      error: {
        code: 500,
        message: 'Failed to list API keys',
      },
    });
  }
});

router.get('/api-keys/:id/limits', requireAdminToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        error: { code: 400, message: 'Key id parameter is required' },
      });
      return;
    }

    const apiKey = await getApiKeyById(id);

    if (!apiKey) {
      res.status(404).json({
        error: { code: 404, message: 'API key not found' },
      });
      return;
    }

    const limit = getEffectiveLimitForApiKey(apiKey);
    const snapshot = getUsageSnapshot(apiKey.id, limit);

    res.json({
      apiKeyId: apiKey.id,
      limit: {
        maxRequestsPerMinute: limit.maxRequestsPerMinute,
        burstFactor: limit.burstFactor ?? 1,
      },
      usage: {
        allowed: snapshot.allowed,
        currentCount: snapshot.currentCount,
        remaining: snapshot.remaining,
        resetAt: snapshot.resetAt.toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('Failed to fetch API key limit', { error: error.message });
    res.status(500).json({
      error: { code: 500, message: 'Failed to fetch API key limit information' },
    });
  }
});

/**
 * POST /admin/api-keys - Create new API key
 */
router.post('/api-keys', requireAdminToken, async (req: Request, res: Response) => {
  try {
    const { tenantId, label, rateLimitPerMinute } = req.body;

    // Validate tenantId
    if (!tenantId || typeof tenantId !== 'string') {
      res.status(400).json({
        error: {
          code: 400,
          message: 'Valid tenantId string is required',
        },
      });
      return;
    }

    // Validate label if provided
    if (label !== undefined && typeof label !== 'string') {
      res.status(400).json({
        error: {
          code: 400,
          message: 'Label must be a string',
        },
      });
      return;
    }

    // Validate rate limit if provided
    if (rateLimitPerMinute !== undefined) {
      if (typeof rateLimitPerMinute !== 'number' || 
          rateLimitPerMinute < 1 || 
          rateLimitPerMinute > 10000) {
        res.status(400).json({
          error: {
            code: 400,
            message: 'Rate limit must be a number between 1 and 10000',
          },
        });
        return;
      }
    }

    const apiKey = await createApiKey({
      tenantId,
      label: label || undefined,
      rateLimitPerMinute: rateLimitPerMinute || undefined,
    });

    logger.info('Admin: Created API key', { tenantId, label });

    res.json({
      apiKey: {
        id: apiKey.id,
        key: apiKey.key,
        label: apiKey.label,
        tenantId: apiKey.tenantId,
        isActive: apiKey.isActive,
        rateLimitPerMinute: apiKey.rateLimitPerMinute,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error: any) {
    logger.error('Failed to create API key', { error: error.message });
    res.status(500).json({
      error: {
        code: 500,
        message: 'Failed to create API key',
      },
    });
  }
});

router.post('/api-keys/:id/deactivate', requireAdminToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deactivateApiKey(id);

    logger.info('Admin: Deactivated API key', { id });

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Failed to deactivate API key', { error: error.message });
    res.status(500).json({
      error: {
        code: 500,
        message: 'Failed to deactivate API key',
      },
    });
  }
});

/**
 * GET /admin/usage - Usage summary endpoint
 */
router.get('/usage', requireAdminToken, async (req: Request, res: Response) => {
  try {
    const { apiKeyId, from, to } = req.query;

    const summary = await getUsageSummary({
      apiKeyId: typeof apiKeyId === 'string' ? apiKeyId : undefined,
      from: typeof from === 'string' ? new Date(from) : undefined,
      to: typeof to === 'string' ? new Date(to) : undefined,
    });

    res.json({ summary });
  } catch (error: any) {
    logger.error('Failed to fetch usage summary', { error: error.message });
    res.status(500).json({
      error: {
        code: 500,
        message: 'Failed to fetch usage summary',
      },
    });
  }
});

router.get('/usage/recent', requireAdminToken, async (req: Request, res: Response) => {
  try {
    const { apiKeyId, limit, since } = req.query;
    const parsedLimit =
      typeof limit === 'string'
        ? Math.min(Math.max(parseInt(limit, 10) || 0, 1), 500)
        : 50;
    const sinceDate = typeof since === 'string' ? new Date(since) : undefined;

    const records = await getRecentUsage({
      apiKeyId: typeof apiKeyId === 'string' ? apiKeyId : undefined,
      limit: parsedLimit,
      since: sinceDate && !isNaN(sinceDate.getTime()) ? sinceDate : undefined,
    });

    res.json({
      records,
      pagination: { limit: parsedLimit },
    });
  } catch (error: any) {
    logger.error('Failed to fetch recent usage', { error: error.message });
    res.status(500).json({
      error: { code: 500, message: 'Failed to fetch recent usage' },
    });
  }
});

router.get('/usage/errors', requireAdminToken, async (req: Request, res: Response) => {
  try {
    const { apiKeyId, limit, since } = req.query;
    const parsedLimit =
      typeof limit === 'string'
        ? Math.min(Math.max(parseInt(limit, 10) || 0, 1), 500)
        : 50;
    const sinceDate = typeof since === 'string' ? new Date(since) : undefined;

    const records = await getRecentErrors({
      apiKeyId: typeof apiKeyId === 'string' ? apiKeyId : undefined,
      limit: parsedLimit,
      since: sinceDate && !isNaN(sinceDate.getTime()) ? sinceDate : undefined,
    });

    res.json({
      records,
      pagination: { limit: parsedLimit },
    });
  } catch (error: any) {
    logger.error('Failed to fetch recent errors', { error: error.message });
    res.status(500).json({
      error: { code: 500, message: 'Failed to fetch error usage events' },
    });
  }
});

export default router;
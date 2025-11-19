import { Router, Request, Response } from 'express';
import { requireAdminToken } from '../middleware/auth.js';
import { logger } from '../config/logger.js';
import { createApiKey, listApiKeys, deactivateApiKey } from '../services/apiKeyService.js';
import { getUsageSummary } from '../services/usageService.js';

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

/**
 * POST /admin/api-keys - Create new API key
 */
router.post('/api-keys', requireAdminToken, async (req: Request, res: Response) => {
  try {
    const { tenantId, label, rateLimitPerMinute } = req.body;

    if (!tenantId || typeof tenantId !== 'string') {
      res.status(400).json({
        error: {
          code: 400,
          message: 'tenantId is required',
        },
      });
      return;
    }

    const apiKey = await createApiKey({
      tenantId,
      label,
      rateLimitPerMinute,
    });

    logger.info('Admin: Created API key', { tenantId, label });

    res.json({
      key: apiKey.key,
      id: apiKey.id,
      label: apiKey.label,
      tenantId: apiKey.tenantId,
      createdAt: apiKey.createdAt,
      rateLimitPerMinute: apiKey.rateLimitPerMinute,
      message: 'API key created successfully. Save this key - it will not be shown again.',
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

/**
 * POST /admin/api-keys/:id/deactivate - Deactivate API key
 */
router.post('/api-keys/:id/deactivate', requireAdminToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        error: {
          code: 400,
          message: 'Key id parameter is required',
        },
      });
      return;
    }

    await deactivateApiKey(id);

    logger.info('Admin: Deactivated API key', { id });

    res.json({
      ok: true,
      message: 'API key deactivated successfully',
    });
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

export default router;

import { Router, Request, Response } from 'express';
import { requireAdminToken, createApiKey, listApiKeys, deleteApiKey } from '../middleware/auth.js';
import { logger } from '../config/logger.js';

const router = Router();

/**
 * GET /admin/keys - List all API keys
 */
router.get('/admin/keys', requireAdminToken, (req: Request, res: Response) => {
  try {
    const keys = listApiKeys();
    
    logger.info('Admin: Listed API keys', {
      count: keys.length,
    });
    
    res.json({
      keys: keys.map(k => ({
        key: k.key.substring(0, 20) + '...',
        name: k.name,
        createdAt: k.createdAt,
        requestCount: k.requestCount,
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
 * POST /admin/keys - Create new API key
 */
router.post('/admin/keys', requireAdminToken, (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string') {
      res.status(400).json({
        error: {
          code: 400,
          message: 'Key name is required',
        },
      });
      return;
    }
    
    const key = createApiKey(name);
    
    logger.info('Admin: Created API key', { name });
    
    res.json({
      key,
      name,
      createdAt: new Date(),
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
 * DELETE /admin/keys/:key - Delete API key
 */
router.delete('/admin/keys/:key', requireAdminToken, (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      res.status(400).json({
        error: {
          code: 400,
          message: 'Key parameter is required',
        },
      });
      return;
    }
    
    const deleted = deleteApiKey(key);
    
    if (!deleted) {
      res.status(404).json({
        error: {
          code: 404,
          message: 'API key not found',
        },
      });
      return;
    }
    
    logger.info('Admin: Deleted API key', { key: key.substring(0, 20) + '...' });
    
    res.json({
      ok: true,
      message: 'API key deleted successfully',
    });
  } catch (error: any) {
    logger.error('Failed to delete API key', { error: error.message });
    res.status(500).json({
      error: {
        code: 500,
        message: 'Failed to delete API key',
      },
    });
  }
});

export default router;

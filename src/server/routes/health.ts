import { Router, Request, Response } from 'express';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';
import { getMetrics } from '../services/metrics.js';

const router = Router();

/**
 * GET /health - Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = {
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      config: {
        antiMevEnabled: config.antiMevEnabled,
        metricsEnabled: config.metricsEnabled,
        wsEnabled: config.wsEnabled,
        databaseConfigured: !!config.databaseUrl,
      },
    };
    
    logger.debug('Health check requested', { ip: req.ip });
    res.json(health);
  } catch (error: any) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      ok: false,
      status: 'unhealthy',
      error: error.message,
    });
  }
});

/**
 * GET /metrics - Prometheus metrics endpoint
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    if (!config.metricsEnabled) {
      res.status(404).json({
        error: {
          code: 404,
          message: 'Metrics disabled',
        },
      });
      return;
    }
    
    const metrics = await getMetrics();
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
  } catch (error: any) {
    logger.error('Failed to generate metrics', { error: error.message });
    res.status(500).json({
      error: {
        code: 500,
        message: 'Failed to generate metrics',
      },
    });
  }
});

export default router;

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { logger } from '../config/logger.js';
import { checkAndConsume, getEffectiveLimitForApiKey } from '../services/rateLimitService.js';

function isRpcRequest(req: AuthenticatedRequest): boolean {
  return req.path.startsWith('/v1/rpc');
}

export function rateLimit(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const apiKey = req.context?.apiKey;

  if (!apiKey) {
    next();
    return;
  }

  try {
    const limit = getEffectiveLimitForApiKey(apiKey);
    const result = checkAndConsume(apiKey.id, limit);

    req.context = { ...(req.context || {}), rateLimit: result };

    if (!result.allowed) {
      logger.warn('Rate limit exceeded', {
        apiKeyId: apiKey.id,
        currentCount: result.currentCount,
        remaining: result.remaining,
        resetAt: result.resetAt.toISOString(),
      });

      if (isRpcRequest(req)) {
        res.status(429).json({
          jsonrpc: '2.0',
          id: (req.body as any)?.id ?? null,
          error: {
            code: -32004,
            message: 'Rate limit exceeded',
          },
        });
        return;
      }

      res.status(429).json({
        error: {
          code: 429,
          message: 'Rate limit exceeded',
        },
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error('Failed to evaluate rate limit', { error: error.message });
    res.status(500).json({
      error: {
        code: 500,
        message: 'Internal rate limit error',
      },
    });
  }
}

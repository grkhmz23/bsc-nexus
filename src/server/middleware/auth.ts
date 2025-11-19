import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';
import { getApiKeyByValue, ApiKeyRecord } from '../services/apiKeyService.js';

export interface RequestContext {
  apiKey?: ApiKeyRecord;
}

export interface AuthenticatedRequest extends Request {
  context?: RequestContext;
}

/**
 * Middleware to require API key authentication
 */
export async function requireApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const apiKeyValue = req.headers['x-api-key'] as string;

  if (!apiKeyValue) {
    logger.warn('API request without key', {
      path: req.path,
      ip: req.ip,
    });
    res.status(401).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32001,
        message: 'API key required. Include x-api-key header.',
      },
    });
    return;
  }

  try {
    const apiKey = await getApiKeyByValue(apiKeyValue);

    if (!apiKey) {
      logger.warn('Invalid API key used', {
        apiKey: apiKeyValue.substring(0, 8) + '...',
        path: req.path,
      });
      res.status(403).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32002,
          message: 'Invalid API key',
        },
      });
      return;
    }

    if (!apiKey.isActive) {
      logger.warn('Inactive API key attempted', { apiKeyId: apiKey.id });
      res.status(403).json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32003,
          message: 'API key inactive',
        },
      });
      return;
    }

    req.context = { ...(req.context || {}), apiKey };

    logger.debug('API request authenticated', {
      keyId: apiKey.id,
      path: req.path,
    });

    next();
  } catch (error: any) {
    logger.error('API key validation error', { error: error.message });
    res.status(500).json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: 'Internal error validating API key',
      },
    });
  }
}

/**
 * Middleware to require admin token
 */
export function requireAdminToken(req: Request, res: Response, next: NextFunction): void {
  const adminToken = req.headers['x-admin-token'] as string;

  if (!adminToken) {
    logger.warn('Admin request without token', { path: req.path, ip: req.ip });
    res.status(401).json({
      error: {
        code: 401,
        message: 'Admin token required. Include x-admin-token header.',
      },
    });
    return;
  }

  if (adminToken !== config.adminToken) {
    logger.warn('Invalid admin token used', { path: req.path });
    res.status(401).json({
      error: {
        code: 401,
        message: 'Invalid admin token',
      },
    });
    return;
  }

  logger.info('Admin request authenticated', { path: req.path });
  next();
}

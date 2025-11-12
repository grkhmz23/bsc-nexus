import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';

// In-memory API key storage (replace with database in production)
const validApiKeys = new Map<string, { name: string; createdAt: Date; requestCount: number }>();

// Add a default development key
if (config.nodeEnv === 'development') {
  validApiKeys.set('dev-key-123', {
    name: 'Development Key',
    createdAt: new Date(),
    requestCount: 0,
  });
}

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
  apiKeyData?: { name: string; createdAt: Date; requestCount: number };
}

/**
 * Middleware to require API key authentication
 */
export function requireApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    logger.warn('API request without key', { 
      path: req.path, 
      ip: req.ip 
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
  
  const keyData = validApiKeys.get(apiKey);
  
  if (!keyData) {
    logger.warn('Invalid API key used', { 
      apiKey: apiKey.substring(0, 8) + '...', 
      path: req.path 
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
  
  // Track usage
  keyData.requestCount++;
  req.apiKey = apiKey;
  req.apiKeyData = keyData;
  
  logger.debug('API request authenticated', { 
    keyName: keyData.name, 
    path: req.path 
  });
  
  next();
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

/**
 * Create a new API key
 */
export function createApiKey(name: string): string {
  const key = `bsc-nexus-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  validApiKeys.set(key, {
    name,
    createdAt: new Date(),
    requestCount: 0,
  });
  logger.info('API key created', { name, key: key.substring(0, 15) + '...' });
  return key;
}

/**
 * List all API keys
 */
export function listApiKeys(): Array<{ key: string; name: string; createdAt: Date; requestCount: number }> {
  return Array.from(validApiKeys.entries()).map(([key, data]) => ({
    key,
    ...data,
  }));
}

/**
 * Delete an API key
 */
export function deleteApiKey(key: string): boolean {
  const deleted = validApiKeys.delete(key);
  if (deleted) {
    logger.info('API key deleted', { key: key.substring(0, 15) + '...' });
  }
  return deleted;
}

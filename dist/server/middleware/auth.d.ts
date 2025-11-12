import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    apiKey?: string;
    apiKeyData?: {
        name: string;
        createdAt: Date;
        requestCount: number;
    };
}
/**
 * Middleware to require API key authentication
 */
export declare function requireApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
/**
 * Middleware to require admin token
 */
export declare function requireAdminToken(req: Request, res: Response, next: NextFunction): void;
/**
 * Create a new API key
 */
export declare function createApiKey(name: string): string;
/**
 * List all API keys
 */
export declare function listApiKeys(): Array<{
    key: string;
    name: string;
    createdAt: Date;
    requestCount: number;
}>;
/**
 * Delete an API key
 */
export declare function deleteApiKey(key: string): boolean;
//# sourceMappingURL=auth.d.ts.map
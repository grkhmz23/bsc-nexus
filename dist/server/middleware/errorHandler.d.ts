import { Request, Response, NextFunction } from 'express';
export interface JsonRpcError {
    jsonrpc: '2.0';
    id: number | string | null;
    error: {
        code: number;
        message: string;
        data?: any;
    };
}
/**
 * Global error handler middleware
 */
export declare function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void;
/**
 * 404 handler
 */
export declare function notFoundHandler(req: Request, res: Response): void;
//# sourceMappingURL=errorHandler.d.ts.map
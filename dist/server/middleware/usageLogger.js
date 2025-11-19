import { logApiUsage } from '../services/usageService.js';
import { logger } from '../config/logger.js';
export function usageLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const apiKeyId = req.context?.apiKey?.id;
        if (!apiKeyId) {
            return;
        }
        const latencyMs = Date.now() - start;
        const endpoint = req.route?.path || req.path;
        const method = typeof req.body === 'object' && req.body?.method ? req.body.method : req.method;
        logApiUsage({
            apiKeyId,
            endpoint,
            method,
            statusCode: res.statusCode,
            latencyMs,
            timestamp: new Date(),
        }).catch(error => {
            logger.error('Failed to record API usage', { error });
        });
    });
    next();
}
//# sourceMappingURL=usageLogger.js.map
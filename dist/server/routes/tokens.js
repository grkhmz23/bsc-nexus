import { Router } from 'express';
import { requireApiKey } from '../middleware/auth.js';
import { getTokenInfo } from '../services/tokenService.js';
import { logger } from '../config/logger.js';
const router = Router();
/**
 * GET /v1/tokens/:address/info - Get token information
 */
router.get('/v1/tokens/:address/info', requireApiKey, async (req, res) => {
    try {
        const { address } = req.params;
        if (!address) {
            res.status(400).json({
                error: {
                    code: 400,
                    message: 'Token address is required',
                },
            });
            return;
        }
        logger.info('Token info requested', {
            address,
            apiKey: req.apiKeyData?.name,
        });
        const tokenInfo = await getTokenInfo(address);
        res.json(tokenInfo);
    }
    catch (error) {
        logger.error('Failed to fetch token info', {
            address: req.params.address,
            error: error.message,
        });
        res.status(500).json({
            error: {
                code: 500,
                message: error.message || 'Failed to fetch token information',
            },
        });
    }
});
export default router;
//# sourceMappingURL=tokens.js.map
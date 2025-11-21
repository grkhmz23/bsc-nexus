import { logger } from '../config/logger.js';
import { config } from '../config/env.js';
class MevProtectionService {
    async protectTransaction(tx, options) {
        // Generate a stub hash if none is present
        const txHash = typeof tx?.hash === 'string'
            ? tx.hash
            : ('0x' + Math.random().toString(16).slice(2).padEnd(64, '0'));
        if (!options.enabled || !config.mevProtectionEnabled) {
            logger.info('MEV protection disabled, forwarding transaction as-is', { txHash });
            return {
                txHash,
                protection: {
                    protected: false,
                    strategy: 'disabled',
                    confidenceScore: 0,
                },
            };
        }
        const strategy = options.strategy || config.mevProtectionStrategy;
        logger.info('Applying stub MEV protection', {
            txHash,
            strategy,
        });
        return {
            txHash,
            protection: {
                protected: true,
                strategy,
                confidenceScore: options.minConfidenceScore ?? config.mevProtectionMinConfidence,
            },
        };
    }
}
export const mevProtectionService = new MevProtectionService();

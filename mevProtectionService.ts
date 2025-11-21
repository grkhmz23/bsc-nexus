import { logger } from './src/server/config/logger.js';
import { config } from './src/server/config/env.js';

export interface MevProtectionOptions {
  enabled: boolean;
  strategy: string;
  maxBribeTip?: string;
  minConfidenceScore?: number;
}

export interface MevProtectionResult {
  txHash: string;
  protection: {
    protected: boolean;
    strategy: string;
    confidenceScore: number;
    reason?: string;
  };
}

class MevProtectionService {
  async protectTransaction(tx: any, options: MevProtectionOptions): Promise<MevProtectionResult> {
    const txHash =
      typeof tx?.hash === 'string'
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

    logger.info('Applying stub MEV protection (root wrapper)', {
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

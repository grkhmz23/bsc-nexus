import axios from 'axios';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';
/**
 * Pick a random RPC URL from the fallback list
 */
function pickPublicFallback() {
    const list = config.upstreamRpcUrls;
    if (list.length === 0) {
        throw new Error('No RPC endpoints configured');
    }
    return list[Math.floor(Math.random() * list.length)];
}
/**
 * Generate random delay for anti-MEV
 */
function randomDelayMs() {
    const min = config.antiMevRandomDelayMin;
    const max = config.antiMevRandomDelayMax;
    if (max <= min)
        return 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Forward JSON-RPC request to upstream
 */
async function forwardJsonRpc(url, body, timeout = 15000) {
    try {
        const response = await axios.post(url, body, {
            timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    catch (error) {
        if (error.response?.data) {
            return error.response.data;
        }
        throw error;
    }
}
/**
 * Main RPC proxy function with Anti-MEV support
 */
export async function proxyRpcRequest(request, options = {}) {
    const isSendRawTransaction = request.method === 'eth_sendRawTransaction';
    const timeout = options.timeout || 15000;
    // Anti-MEV routing for raw transactions
    if (config.antiMevEnabled &&
        isSendRawTransaction &&
        !options.disableAntiMev &&
        config.privateRelayUrl) {
        logger.info('Routing transaction through Anti-MEV path', {
            method: request.method,
            id: request.id,
        });
        // Apply random delay
        const delay = randomDelayMs();
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            logger.debug('Applied Anti-MEV delay', { delayMs: delay });
        }
        // Try private relay first
        try {
            const relayResponse = await forwardJsonRpc(config.privateRelayUrl, request, timeout);
            logger.info('Transaction sent via private relay', {
                id: request.id,
                hasResult: !!relayResponse.result,
            });
            return relayResponse;
        }
        catch (relayError) {
            logger.warn('Private relay failed', {
                error: relayError.message,
                id: request.id,
            });
            // Hard fail if configured
            if (config.antiMevHardFailOnRelayError) {
                return {
                    jsonrpc: '2.0',
                    id: request.id,
                    error: {
                        code: -32001,
                        message: 'Private relay unavailable',
                        data: relayError.message,
                    },
                };
            }
            // Fallback to public RPC
            logger.info('Falling back to public RPC', { id: request.id });
        }
    }
    // Standard routing (or fallback from Anti-MEV)
    const rpcUrl = config.upstreamRpcUrl || pickPublicFallback();
    try {
        logger.debug('Forwarding to upstream RPC', {
            method: request.method,
            id: request.id,
            url: rpcUrl,
        });
        const response = await forwardJsonRpc(rpcUrl, request, timeout);
        logger.debug('RPC response received', {
            id: request.id,
            hasResult: !!response.result,
            hasError: !!response.error,
        });
        return response;
    }
    catch (error) {
        logger.error('RPC request failed', {
            error: error.message,
            method: request.method,
            id: request.id,
        });
        return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
                code: -32603,
                message: 'Upstream RPC error',
                data: error.message,
            },
        };
    }
}
/**
 * Validate JSON-RPC request format
 */
export function validateJsonRpcRequest(body) {
    if (!body || typeof body !== 'object') {
        return { valid: false, error: 'Request body must be a JSON object' };
    }
    if (body.jsonrpc !== '2.0') {
        return { valid: false, error: 'jsonrpc must be "2.0"' };
    }
    if (!body.method || typeof body.method !== 'string') {
        return { valid: false, error: 'method must be a string' };
    }
    if (!Array.isArray(body.params)) {
        return { valid: false, error: 'params must be an array' };
    }
    return {
        valid: true,
        request: body,
    };
}
//# sourceMappingURL=rpcProxy.js.map
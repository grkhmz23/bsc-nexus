export interface JsonRpcRequest {
    jsonrpc: '2.0';
    id: number | string | null;
    method: string;
    params: any[];
}
export interface JsonRpcResponse {
    jsonrpc: '2.0';
    id: number | string | null;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}
interface ProxyOptions {
    disableAntiMev?: boolean;
    timeout?: number;
}
/**
 * Main RPC proxy function with Anti-MEV support
 */
export declare function proxyRpcRequest(request: JsonRpcRequest, options?: ProxyOptions): Promise<JsonRpcResponse>;
/**
 * Validate JSON-RPC request format
 */
export declare function validateJsonRpcRequest(body: any): {
    valid: boolean;
    error?: string;
    request?: JsonRpcRequest;
};
export {};
//# sourceMappingURL=rpcProxy.d.ts.map
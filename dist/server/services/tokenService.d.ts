export interface TokenInfo {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply?: string;
}
/**
 * Get token information from BSC
 */
export declare function getTokenInfo(address: string): Promise<TokenInfo>;
/**
 * Get token balance for an address
 */
export declare function getTokenBalance(tokenAddress: string, holderAddress: string): Promise<string>;
//# sourceMappingURL=tokenService.d.ts.map
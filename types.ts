/**
 * BSC Nexus Trading Features - Production Types
 * Version: 2.0
 * Features: Private Transactions, Fast Swaps, Atomic Bundles, MEV Protection
 */

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface SignedTransaction {
  from: string;
  to: string;
  data: string;
  value: string;
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  nonce: number;
  chainId: number;
  type: number; // EIP-1559 = 2
  v?: string;
  r?: string;
  s?: string;
}

export interface PrivateTransactionRequest {
  transaction: SignedTransaction;
  mode: 'standard' | 'fast' | 'turbo' | 'private';
  maxBlockDelay?: number; // Max blocks to wait before reverting
  minBlockDelay?: number; // Min blocks to wait (for timing attacks)
}

export interface TransactionStatus {
  txHash: string;
  status: 'pending' | 'mined' | 'confirmed' | 'failed' | 'reverted';
  mode: string;
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
  confirmations?: number;
  error?: string;
  mevProtected: boolean;
  submittedAt: number;
  minedAt?: number;
}

// ============================================================================
// SWAP TYPES
// ============================================================================

export interface SwapRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageTolerance: number; // Basis points (50 = 0.5%)
  recipient: string;
  deadline: number; // Unix timestamp
  routingPreference: 'speed' | 'price' | 'balanced';
  maxHops?: number; // Max intermediate tokens (default 2)
  enableSplitRoute?: boolean; // Allow splitting across multiple paths
}

export interface SwapRoute {
  path: string[];
  pools: string[];
  router: string;
  routerName: string;
  percentage: number; // For split routes (100 = all)
}

export interface SwapQuote {
  amountOut: string;
  amountOutMin: string;
  routes: SwapRoute[];
  priceImpact: string; // Basis points
  estimatedGas: string;
  effectiveRate: string; // Output per input
  breakdown: {
    inputValue: string;
    outputValue: string;
    minimumOutput: string;
    lpFees: string;
    protocolFees: string;
    networkFees: string;
  };
  warnings: string[];
  expiresAt: number;
}

export interface SwapExecution {
  quote: SwapQuote;
  transaction: SignedTransaction;
  txHash: string;
  status: 'submitted' | 'pending' | 'confirmed' | 'failed';
  submittedAt: number;
  estimatedCompletionTime: number;
  mevProtection: {
    enabled: boolean;
    method: string;
    confidence: number; // 0-100
  };
}

// ============================================================================
// BUNDLE TYPES
// ============================================================================

export interface BundleTransaction {
  transaction: SignedTransaction;
  description?: string;
  conditions?: {
    requireSuccess?: boolean; // Revert entire bundle if fails
    minGasPrice?: string;
    maxGasPrice?: string;
  };
}

export interface BundleRequest {
  transactions: BundleTransaction[];
  mode: 'atomic' | 'conditional' | 'sequential';
  targetBlock?: number; // Specific block to execute in
  maxBlockDelay?: number; // Max blocks from submission
  revertOnFailure: boolean; // Atomic only
  simulateFirst?: boolean; // Test before submission
}

export interface BundleSimulation {
  success: boolean;
  results: Array<{
    index: number;
    success: boolean;
    gasUsed: string;
    returnData: string;
    error?: string;
  }>;
  totalGasUsed: string;
  estimatedCost: string;
}

export interface BundleStatus {
  bundleId: string;
  status: 'simulating' | 'pending' | 'submitted' | 'confirmed' | 'failed' | 'partial';
  transactions: Array<{
    index: number;
    txHash?: string;
    status: 'pending' | 'submitted' | 'confirmed' | 'failed';
    blockNumber?: number;
    gasUsed?: string;
    error?: string;
  }>;
  targetBlock?: number;
  actualBlock?: number;
  submittedAt: number;
  confirmedAt?: number;
  totalGasUsed?: string;
  totalCost?: string;
}

// ============================================================================
// MEV PROTECTION TYPES
// ============================================================================

export interface MEVProtectionConfig {
  enabled: boolean;
  strategy: 'flashbots' | 'private-mempool' | 'direct-validator' | 'eden' | 'custom';
  targetValidators?: string[]; // For direct validator mode
  maxBribeTip?: string; // Maximum MEV tip
  minConfidenceScore?: number; // 0-100, minimum protection confidence
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface MEVProtectionResult {
  protected: boolean;
  method: string;
  confidence: number; // 0-100
  details: {
    privateSubmission: boolean;
    validatorDirect: boolean;
    flashbotsBundle: boolean;
    bundleHash?: string;
    targetValidators?: string[];
  };
  cost: {
    baseFee: string;
    priorityFee: string;
    mevTip: string;
    total: string;
  };
}

// ============================================================================
// LIQUIDITY & ROUTING TYPES
// ============================================================================

export interface LiquidityPool {
  address: string;
  dex: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  fee: number; // Basis points
  lastUpdate: number;
}

export interface RouteOptimization {
  bestRoute: SwapRoute;
  alternativeRoutes: SwapRoute[];
  optimization: {
    priceImpact: string;
    gasEfficiency: string;
    liquidityScore: number;
    reliabilityScore: number;
  };
  reasoning: string;
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export interface TradingMetrics {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  successRate: number;
  averageExecutionTime: number;
  medianExecutionTime: number;
  fastestExecution: number;
  slowestExecution: number;
  mevProtectedTransactions: number;
  mevSavings: string; // USD value saved from MEV
  bundlesExecuted: number;
  bundleSuccessRate: number;
  totalVolumeUSD: string;
  totalFeesUSD: string;
  averageGasUsed: string;
  uptime: number; // Percentage
  lastUpdated: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface TransactionError {
  code: 'INSUFFICIENT_FUNDS' | 'GAS_TOO_LOW' | 'NONCE_TOO_LOW' | 'SLIPPAGE_EXCEEDED' | 
        'DEADLINE_EXCEEDED' | 'PRICE_IMPACT_TOO_HIGH' | 'INSUFFICIENT_LIQUIDITY' |
        'TRANSACTION_REVERTED' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN';
  message: string;
  details?: any;
  recoverable: boolean;
  suggestedAction?: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// GAS ESTIMATION TYPES
// ============================================================================

export interface GasEstimate {
  baseFee: string;
  priorityFee: string;
  maxFeePerGas: string;
  gasLimit: string;
  totalCost: string;
  totalCostUSD: string;
  speed: 'slow' | 'medium' | 'fast' | 'instant';
  estimatedTime: number; // Seconds
}

export interface GasStrategy {
  mode: 'economy' | 'standard' | 'fast' | 'turbo';
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  gasLimit: string;
  estimatedTime: number;
  confidence: number; // 0-100
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface TradingConfig {
  maxSlippage: number; // Basis points
  maxPriceImpact: number; // Basis points
  defaultDeadline: number; // Seconds
  gasBuffer: number; // Percentage (20 = 20%)
  maxGasPrice: string; // Gwei
  mevProtection: MEVProtectionConfig;
  retryStrategy: {
    maxRetries: number;
    backoffMs: number;
    multiplier: number;
  };
  monitoring: {
    enabled: boolean;
    reportInterval: number;
    alertThresholds: {
      failureRate: number;
      averageGasUsed: string;
    };
  };
}

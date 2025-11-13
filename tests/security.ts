import axios from 'axios';
import { TestConfig, TestResult } from './types.js';

// Helper function to reduce complexity
async function testEndpoint(
  url: string,
  name: string,
  config: TestConfig,
  headers: Record<string, string>,
  expectedStatus: number | number[],
  successMessage: string,
  errorMessage: string,
  suggestion: string
): Promise<TestResult> {
  const start = Date.now();
  const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  
  try {
    const response = await axios.post(
      url,
      { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] },
      {
        headers,
        timeout: config.requestTimeout,
        validateStatus: () => true,
      }
    );
    
    const passed = expectedStatuses.includes(response.status);
    return {
      name,
      category: 'Security',
      passed,
      duration: Date.now() - start,
      details: passed ? successMessage : `Endpoint returned ${response.status}`,
      error: !passed ? errorMessage : undefined,
      suggestion: !passed ? suggestion : undefined,
    };
  } catch (error: any) {
    return {
      name,
      category: 'Security',
      passed: false,
      duration: Date.now() - start,
      error: error.message,
      suggestion: 'Check if server is running and accessible',
    };
  }
}

// Helper for GET requests
async function testGetEndpoint(
  url: string,
  name: string,
  config: TestConfig,
  expectedStatus: number,
  successMessage: string,
  errorMessage: string,
  suggestion: string
): Promise<TestResult> {
  const start = Date.now();
  
  try {
    const response = await axios.get(url, {
      timeout: config.requestTimeout,
      validateStatus: () => true,
    });
    
    const passed = response.status === expectedStatus;
    return {
      name,
      category: 'Security',
      passed,
      duration: Date.now() - start,
      details: passed ? successMessage : `Endpoint returned ${response.status}`,
      error: !passed ? errorMessage : undefined,
      suggestion: !passed ? suggestion : undefined,
    };
  } catch (error: any) {
    return {
      name,
      category: 'Security',
      passed: false,
      duration: Date.now() - start,
      error: error.message,
      suggestion: 'Check if server is running and accessible',
    };
  }
}

export async function testSecurity(config: TestConfig): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  // Test 1: RPC endpoint requires API key
  results.push(
    await testEndpoint(
      `${config.serverUrl}/v1/rpc`,
      'RPC endpoint requires API key',
      config,
      {},
      [401, 403],
      'Correctly returns 401/403 without API key',
      'Endpoint accessible without API key',
      'Add requireApiKey middleware to /v1/rpc endpoint'
    )
  );
  
  // Test 2: Invalid API key returns 403
  results.push(
    await testEndpoint(
      `${config.serverUrl}/v1/rpc`,
      'Invalid API key returns 403',
      config,
      { 'x-api-key': 'invalid-key-12345' },
      403,
      'Correctly rejects invalid API keys',
      'Invalid API key accepted',
      'Verify API key validation logic'
    )
  );
  
  // Test 3: Admin endpoint requires admin token
  results.push(
    await testGetEndpoint(
      `${config.serverUrl}/admin/api-keys`,
      'Admin endpoint requires admin token',
      config,
      401,
      'Correctly requires admin token',
      'Admin endpoint accessible without token',
      'Add admin token validation middleware'
    )
  );
  
  // Test 4: Invalid admin token returns 401
  const start4 = Date.now();
  try {
    const response = await axios.get(
      `${config.serverUrl}/admin/api-keys`,
      {
        headers: { 'x-admin-token': 'invalid-token' },
        timeout: config.requestTimeout,
        validateStatus: () => true,
      }
    );
    
    const is401 = response.status === 401;
    results.push({
      name: 'Invalid admin token returns 401',
      category: 'Security',
      passed: is401,
      duration: Date.now() - start4,
      details: is401 
        ? 'Correctly rejects invalid admin tokens' 
        : `Endpoint returned ${response.status}`,
      error: !is401 ? 'Invalid admin token accepted' : undefined,
      suggestion: !is401 ? 'Verify admin token validation' : undefined,
    });
  } catch (error: any) {
    results.push({
      name: 'Invalid admin token returns 401',
      category: 'Security',
      passed: false,
      duration: Date.now() - start4,
      error: error.message,
      suggestion: 'Check if server is running and accessible',
    });
  }
  
  // Test 5: Health endpoint is public
  results.push(
    await testGetEndpoint(
      `${config.serverUrl}/health`,
      'Health endpoint is public',
      config,
      200,
      'Health endpoint correctly accessible without auth',
      'Health endpoint requires auth',
      'Health endpoint should be public for monitoring'
    )
  );
  
  return results;
}
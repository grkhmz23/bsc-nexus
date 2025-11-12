import axios from 'axios';
import { TestConfig, TestResult } from '../types.js';

export async function testSecurity(config: TestConfig): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  // Test 1: RPC endpoint requires API key
  const start1 = Date.now();
  try {
    const response = await axios.post(
      `${config.serverUrl}/v1/rpc`,
      { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] },
      {
        timeout: config.requestTimeout,
        validateStatus: () => true, // Don't throw on non-200
      }
    );
    
    const is401or403 = response.status === 401 || response.status === 403;
    results.push({
      name: 'RPC endpoint requires API key',
      category: 'Security',
      passed: is401or403,
      duration: Date.now() - start1,
      details: is401or403 ? 'Correctly returns 401/403 without API key' : `Endpoint returned ${response.status}`,
      error: !is401or403 ? 'Endpoint accessible without API key' : undefined,
      suggestion: !is401or403 ? 'Add requireApiKey middleware to /v1/rpc endpoint' : undefined,
    });
  } catch (error: any) {
    results.push({
      name: 'RPC endpoint requires API key',
      category: 'Security',
      passed: false,
      duration: Date.now() - start1,
      error: error.message,
      suggestion: 'Check if server is running and accessible',
    });
  }
  
  // Test 2: Invalid API key returns 403
  const start2 = Date.now();
  try {
    const response = await axios.post(
      `${config.serverUrl}/v1/rpc`,
      { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] },
      {
        headers: { 'x-api-key': 'invalid-key-12345' },
        timeout: config.requestTimeout,
        validateStatus: () => true,
      }
    );
    
    const is403 = response.status === 403;
    results.push({
      name: 'Invalid API key returns 403',
      category: 'Security',
      passed: is403,
      duration: Date.now() - start2,
      details: is403 ? 'Correctly rejects invalid API keys' : `Endpoint returned ${response.status}`,
      error: !is403 ? 'Invalid API key accepted' : undefined,
      suggestion: !is403 ? 'Verify API key validation logic' : undefined,
    });
  } catch (error: any) {
    results.push({
      name: 'Invalid API key returns 403',
      category: 'Security',
      passed: false,
      duration: Date.now() - start2,
      error: error.message,
      suggestion: 'Check if server is running and accessible',
    });
  }
  
  // Test 3: Admin endpoint requires admin token
  const start3 = Date.now();
  try {
    const response = await axios.get(
      `${config.serverUrl}/admin/keys`,
      {
        timeout: config.requestTimeout,
        validateStatus: () => true,
      }
    );
    
    const is401 = response.status === 401;
    results.push({
      name: 'Admin endpoint requires admin token',
      category: 'Security',
      passed: is401,
      duration: Date.now() - start3,
      details: is401 ? 'Correctly requires admin token' : `Endpoint returned ${response.status}`,
      error: !is401 ? 'Admin endpoint accessible without token' : undefined,
      suggestion: !is401 ? 'Add admin token validation middleware' : undefined,
    });
  } catch (error: any) {
    results.push({
      name: 'Admin endpoint requires admin token',
      category: 'Security',
      passed: false,
      duration: Date.now() - start3,
      error: error.message,
      suggestion: 'Check if server is running and accessible',
    });
  }
  
  // Test 4: Invalid admin token returns 401
  const start4 = Date.now();
  try {
    const response = await axios.get(
      `${config.serverUrl}/admin/keys`,
      {
        headers: { 'x-admin-token': 'wrong-token' },
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
      details: is401 ? 'Correctly rejects invalid admin tokens' : `Endpoint returned ${response.status}`,
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
  
  // Test 5: Health endpoint is public (no auth required)
  const start5 = Date.now();
  try {
    const response = await axios.get(
      `${config.serverUrl}/health`,
      {
        timeout: config.requestTimeout,
      }
    );
    
    const passed = response.status === 200;
    results.push({
      name: 'Health endpoint is public',
      category: 'Security',
      passed,
      duration: Date.now() - start5,
      details: passed ? 'Health endpoint correctly accessible without auth' : 'Health endpoint requires auth',
      suggestion: !passed ? 'Health endpoint should be public for monitoring' : undefined,
    });
  } catch (error: any) {
    results.push({
      name: 'Health endpoint is public',
      category: 'Security',
      passed: false,
      duration: Date.now() - start5,
      error: error.message,
    });
  }
  
  return results;
}

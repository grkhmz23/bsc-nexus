import axios from 'axios';
import { TestConfig, TestResult } from '../types.js';

export async function testWebhooks(config: TestConfig): Promise<TestResult[]> {
  const results: TestResult[] = [];
  let webhookId: string | undefined;
  
  // Test 1: Create webhook
  const start1 = Date.now();
  try {
    const response = await axios.post(
      `${config.serverUrl}/v1/webhooks`,
      {
        event: 'token_transfer',
        callbackUrl: config.webhookTestUrl,
      },
      {
        headers: {
          'x-api-key': config.apiKey,
          'content-type': 'application/json',
        },
        timeout: config.requestTimeout,
      }
    );
    
    const passed = response.status === 200 && response.data?.id && response.data?.secret;
    webhookId = response.data?.id;
    
    results.push({
      name: 'POST /v1/webhooks - Create webhook',
      category: 'Webhooks',
      passed,
      duration: Date.now() - start1,
      details: passed ? `Webhook created with ID: ${webhookId}` : 'Failed to create webhook',
      suggestion: !passed ? 'Check database connection and webhook schema' : undefined,
    });
  } catch (error: any) {
    results.push({
      name: 'POST /v1/webhooks - Create webhook',
      category: 'Webhooks',
      passed: false,
      duration: Date.now() - start1,
      error: error.message,
      suggestion: error.response?.status === 401 ? 'Verify API key is valid' : 'Check webhook endpoint implementation',
    });
  }
  
  // Test 2: List webhooks
  const start2 = Date.now();
  try {
    const response = await axios.get(
      `${config.serverUrl}/v1/webhooks`,
      {
        headers: {
          'x-api-key': config.apiKey,
        },
        timeout: config.requestTimeout,
      }
    );
    
    const passed = response.status === 200 && Array.isArray(response.data?.webhooks);
    results.push({
      name: 'GET /v1/webhooks - List webhooks',
      category: 'Webhooks',
      passed,
      duration: Date.now() - start2,
      details: passed ? `Found ${response.data.webhooks.length} webhook(s)` : 'Failed to list webhooks',
      suggestion: !passed ? 'Verify webhook listing query is correct' : undefined,
    });
  } catch (error: any) {
    results.push({
      name: 'GET /v1/webhooks - List webhooks',
      category: 'Webhooks',
      passed: false,
      duration: Date.now() - start2,
      error: error.message,
    });
  }
  
  // Test 3: Send test webhook (only if webhook was created)
  if (webhookId) {
    const start3 = Date.now();
    try {
      const response = await axios.post(
        `${config.serverUrl}/v1/webhooks/test/${webhookId}`,
        {},
        {
          headers: {
            'x-api-key': config.apiKey,
          },
          timeout: config.requestTimeout,
        }
      );
      
      const passed = response.status === 200 && response.data?.delivered !== undefined;
      results.push({
        name: 'POST /v1/webhooks/test/:id - Test webhook',
        category: 'Webhooks',
        passed,
        duration: Date.now() - start3,
        details: passed 
          ? `Test webhook ${response.data.delivered ? 'delivered' : 'failed to deliver'}` 
          : 'Failed to send test webhook',
        suggestion: !passed ? 'Check webhook delivery service and callback URL' : undefined,
      });
    } catch (error: any) {
      results.push({
        name: 'POST /v1/webhooks/test/:id - Test webhook',
        category: 'Webhooks',
        passed: false,
        duration: Date.now() - start3,
        error: error.message,
        suggestion: 'Verify webhook exists and delivery service is working',
      });
    }
  }
  
  // Test 4: Delete webhook (only if webhook was created)
  if (webhookId) {
    const start4 = Date.now();
    try {
      const response = await axios.delete(
        `${config.serverUrl}/v1/webhooks/${webhookId}`,
        {
          headers: {
            'x-api-key': config.apiKey,
          },
          timeout: config.requestTimeout,
        }
      );
      
      const passed = response.status === 200 && response.data?.ok === true;
      results.push({
        name: 'DELETE /v1/webhooks/:id - Delete webhook',
        category: 'Webhooks',
        passed,
        duration: Date.now() - start4,
        details: passed ? 'Webhook successfully deleted' : 'Failed to delete webhook',
        suggestion: !passed ? 'Check webhook deletion logic' : undefined,
      });
    } catch (error: any) {
      results.push({
        name: 'DELETE /v1/webhooks/:id - Delete webhook',
        category: 'Webhooks',
        passed: false,
        duration: Date.now() - start4,
        error: error.message,
      });
    }
  }
  
  return results;
}

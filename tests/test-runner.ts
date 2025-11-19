import chalk from 'chalk';
import { loadConfig } from './config.js';
import { testHealth } from './health.js';
import { testRPC } from './rpc.js';
import { testTokens } from './tokens.js';
import { testGraphQL } from './graphql.js';
import { testWebSocket } from './websocket.js';
import { testWebhooks } from './webhooks.js';
import { testSecurity } from './security.js';
import { testDatabase } from './database.js';
import { testApiKeyService } from './api-key-service.unit.js';
import { testUsageLogger } from './usage-logger.unit.js';
import { testRateLimitService } from './rate-limit-service.unit.js';
import { TestSummary, TestResult } from './types.js';
import { saveHTMLReport } from './report-generator.js';

async function runAllTests(): Promise<TestSummary> {
  console.log(chalk.bold.cyan('\n🔍 BSC Nexus QA Test Suite\n'));
  console.log(chalk.gray('═'.repeat(80)) + '\n');
  
  const config = loadConfig();
  const startTime = Date.now();
  const allResults: TestResult[] = [];
  
  console.log(chalk.yellow('Configuration:'));
  console.log(chalk.gray(`  Server URL: ${config.serverUrl}`));
  console.log(chalk.gray(`  WebSocket URL: ${config.wsUrl}`));
  console.log(chalk.gray(`  Database: ${config.databaseUrl ? 'Configured' : 'Not configured'}\n`));
  
  const testSuites = [
    { name: 'API Key Service', fn: () => testApiKeyService() },
    { name: 'Usage Logger', fn: () => testUsageLogger() },
    { name: 'Rate Limit Service', fn: () => testRateLimitService() },
    { name: 'Health Checks', fn: () => testHealth(config) },
    { name: 'RPC Proxy', fn: () => testRPC(config) },
    { name: 'Token API', fn: () => testTokens(config) },
    { name: 'Security', fn: () => testSecurity(config) },
    // Phase 2 features - disabled for now
    // { name: 'GraphQL API', fn: () => testGraphQL(config) },
    // { name: 'WebSocket', fn: () => testWebSocket(config) },
    // { name: 'Webhooks', fn: () => testWebhooks(config) },
    // { name: 'Database & Indexer', fn: () => testDatabase(config) },
  ];
  
  for (const suite of testSuites) {
    console.log(chalk.bold.white(`\n▶ Running ${suite.name} tests...`));
    try {
      const results = await suite.fn();
      allResults.push(...results);
      
      for (const result of results) {
        const icon = result.passed ? chalk.green('✅') : chalk.red('❌');
        const name = result.passed ? chalk.white(result.name) : chalk.red(result.name);
        console.log(`  ${icon} ${name} ${chalk.gray(`(${result.duration}ms)`)}`);
        
        if (result.details) {
          console.log(chalk.gray(`     ℹ ${result.details}`));
        }
      }
    } catch (error: any) {
      console.error(chalk.red(`  ❌ ${suite.name} suite failed: ${error.message}`));
      allResults.push({
        name: `${suite.name} suite error`,
        category: suite.name,
        passed: false,
        duration: 0,
        details: error.stack || error.message,
      });
    }
  }
  
  const duration = Date.now() - startTime;
  const passedCount = allResults.filter(r => r.passed).length;
  const failedCount = allResults.length - passedCount;
  
  console.log('\n' + chalk.gray('─'.repeat(80)));
  console.log(
    chalk.bold(
      failedCount === 0
        ? chalk.green(`\n✅ All ${allResults.length} tests passed in ${duration}ms\n`)
        : chalk.red(`\n❌ ${failedCount}/${allResults.length} tests failed in ${duration}ms\n`),
    ),
  );
  
  const summary: TestSummary = {
    totalTests: allResults.length,
    passedTests: passedCount,
    failedTests: failedCount,
    durationMs: duration,
    results: allResults,
  };
  
  await saveHTMLReport(summary);
  
  return summary;
}

if (require.main === module) {
  runAllTests().catch(error => {
    console.error(chalk.red('\nFatal error running tests:'), error);
    process.exit(1);
  });
}

export { runAllTests };

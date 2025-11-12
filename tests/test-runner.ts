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
    { name: 'Health Checks', fn: () => testHealth(config) },
    { name: 'RPC Proxy', fn: () => testRPC(config) },
    { name: 'Token API', fn: () => testTokens(config) },
    { name: 'GraphQL API', fn: () => testGraphQL(config) },
    { name: 'WebSocket', fn: () => testWebSocket(config) },
    { name: 'Webhooks', fn: () => testWebhooks(config) },
    { name: 'Security', fn: () => testSecurity(config) },
    { name: 'Database & Indexer', fn: () => testDatabase(config) },
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
        if (result.error) {
          console.log(chalk.yellow(`     ⚠ Error: ${result.error}`));
        }
        if (result.suggestion) {
          console.log(chalk.cyan(`     💡 Suggestion: ${result.suggestion}`));
        }
      }
    } catch (error: any) {
      console.log(chalk.red(`  ❌ Suite failed: ${error.message}`));
    }
  }
  
  const duration = Date.now() - startTime;
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;
  
  const summary: TestSummary = {
    total: allResults.length,
    passed,
    failed,
    duration,
    timestamp: new Date(),
    results: allResults,
  };
  
  console.log(chalk.gray('\n' + '═'.repeat(80)));
  console.log(chalk.bold.white('\n📊 Test Summary\n'));
  console.log(chalk.white(`  Total Tests:  ${summary.total}`));
  
  const passRate = summary.total > 0 ? ((passed/summary.total)*100).toFixed(1) : '0.0';
  const failRate = summary.total > 0 ? ((failed/summary.total)*100).toFixed(1) : '0.0';
  
  console.log(chalk.green(`  Passed:       ${summary.passed} (${passRate}%)`));
  console.log(chalk.red(`  Failed:       ${summary.failed} (${failRate}%)`));
  console.log(chalk.cyan(`  Duration:     ${(duration/1000).toFixed(2)}s`));
  
  if (failed === 0) {
    console.log(chalk.bold.green('\n🎉 All tests passed! Your BSC Nexus infrastructure is working correctly.\n'));
  } else {
    console.log(chalk.bold.yellow('\n⚠️  Some tests failed. Check the suggestions above to fix the issues.\n'));
  }
  
  // Save HTML report
  saveHTMLReport(summary);
  
  return summary;
}

// Run tests
runAllTests()
  .then((summary) => {
    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
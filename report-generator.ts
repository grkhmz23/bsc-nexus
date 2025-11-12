import fs from 'node:fs';
import { TestSummary } from './types.js';

export function generateHTMLReport(summary: TestSummary): string {
  const passRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : '0.0';
  const failRate = summary.total > 0 ? ((summary.failed / summary.total) * 100).toFixed(1) : '0.0';
  
  const groupedResults = summary.results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, typeof summary.results>);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BSC Nexus QA Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .header p { font-size: 1.1em; opacity: 0.9; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #f8f9fa;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    .summary-card .value {
      font-size: 2.5em;
      font-weight: bold;
      margin: 10px 0;
    }
    .summary-card .label {
      color: #666;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .summary-card.passed .value { color: #28a745; }
    .summary-card.failed .value { color: #dc3545; }
    .summary-card.total .value { color: #667eea; }
    .summary-card.duration .value { color: #ff6b6b; font-size: 2em; }
    .results {
      padding: 30px;
    }
    .category {
      margin-bottom: 30px;
    }
    .category-header {
      font-size: 1.5em;
      font-weight: bold;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
    }
    .test-result {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 10px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .test-result:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .test-result.passed { border-left: 4px solid #28a745; }
    .test-result.failed { border-left: 4px solid #dc3545; }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .test-name {
      font-weight: 600;
      font-size: 1.1em;
      color: #333;
    }
    .test-status {
      font-size: 1.5em;
      font-weight: bold;
    }
    .test-status.passed { color: #28a745; }
    .test-status.failed { color: #dc3545; }
    .test-details {
      color: #666;
      margin-top: 8px;
      font-size: 0.95em;
      line-height: 1.6;
    }
    .test-error {
      background: #fff3cd;
      border-left: 3px solid #ffc107;
      padding: 10px;
      margin-top: 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #856404;
    }
    .test-suggestion {
      background: #d1ecf1;
      border-left: 3px solid #17a2b8;
      padding: 10px;
      margin-top: 8px;
      border-radius: 4px;
      font-size: 0.9em;
      color: #0c5460;
    }
    .test-duration {
      color: #999;
      font-size: 0.85em;
      margin-top: 5px;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      margin-left: 10px;
    }
    .badge.passed { background: #d4edda; color: #155724; }
    .badge.failed { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 BSC Nexus QA Test Report</h1>
      <p>Comprehensive testing of Node.js + Redis + Postgres infrastructure</p>
      <p style="font-size: 0.9em; margin-top: 10px;">${summary.timestamp.toLocaleString()}</p>
    </div>
    
    <div class="summary">
      <div class="summary-card total">
        <div class="label">Total Tests</div>
        <div class="value">${summary.total}</div>
      </div>
      <div class="summary-card passed">
        <div class="label">Passed</div>
        <div class="value">✅ ${summary.passed}</div>
        <div class="label" style="margin-top: 5px;">${passRate}%</div>
      </div>
      <div class="summary-card failed">
        <div class="label">Failed</div>
        <div class="value">❌ ${summary.failed}</div>
        <div class="label" style="margin-top: 5px;">${failRate}%</div>
      </div>
      <div class="summary-card duration">
        <div class="label">Duration</div>
        <div class="value">${(summary.duration / 1000).toFixed(2)}s</div>
      </div>
    </div>
    
    <div class="results">
      ${Object.entries(groupedResults).map(([category, tests]) => `
        <div class="category">
          <div class="category-header">
            ${category}
            <span class="badge ${tests.every(t => t.passed) ? 'passed' : 'failed'}">
              ${tests.filter(t => t.passed).length}/${tests.length} passed
            </span>
          </div>
          ${tests.map(test => `
            <div class="test-result ${test.passed ? 'passed' : 'failed'}">
              <div class="test-header">
                <div class="test-name">${test.name}</div>
                <div class="test-status ${test.passed ? 'passed' : 'failed'}">
                  ${test.passed ? '✅' : '❌'}
                </div>
              </div>
              ${test.details ? `<div class="test-details">${test.details}</div>` : ''}
              ${test.error ? `<div class="test-error"><strong>Error:</strong> ${test.error}</div>` : ''}
              ${test.suggestion ? `<div class="test-suggestion"><strong>💡 Suggestion:</strong> ${test.suggestion}</div>` : ''}
              <div class="test-duration">⏱️ ${test.duration}ms</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
    
    <div class="footer">
      <p><strong>BSC Nexus QA Testing Suite</strong> | Generated on ${summary.timestamp.toLocaleDateString()}</p>
      <p style="margin-top: 10px; font-size: 0.9em;">
        ${summary.failed === 0 
          ? '🎉 All tests passed! Your BSC Nexus infrastructure is working correctly.' 
          : '⚠️ Some tests failed. Review the suggestions above to fix the issues.'}
      </p>
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

export function saveHTMLReport(summary: TestSummary, filename: string = 'test-report.html'): void {
  const html = generateHTMLReport(summary);
  fs.writeFileSync(filename, html, 'utf-8');
  console.log(`\n📄 HTML report saved to: ${filename}`);
}

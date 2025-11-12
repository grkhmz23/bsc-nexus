# BSC Nexus QA Testing Suite

A comprehensive automated QA testing suite for the **BSC Nexus** backend platform. This suite validates all endpoints, WebSocket functionality, database operations, and security controls.

## 🎯 What This Tests

The QA suite automatically tests all BSC Nexus features:

- ✅ **Health Checks** - `/health` and `/metrics` endpoints
- ✅ **RPC Proxy** - JSON-RPC forwarding to BSC mainnet
- ✅ **Token API** - Token information retrieval
- ✅ **GraphQL API** - GraphQL queries for token data
- ✅ **WebSocket** - Real-time event subscriptions
- ✅ **Webhooks** - Creation, testing, and deletion
- ✅ **Security** - Authentication and authorization
- ✅ **Database & Indexer** - PostgreSQL connectivity and transfer data

## 🚀 Quick Start

### Prerequisites

**IMPORTANT**: This QA suite requires a running BSC Nexus server to test against.

#### Option 1: Test Against Local BSC Nexus Server

If you have BSC Nexus running locally:

1. Start BSC Nexus server (in the `bsc-nexus/` directory):
   ```bash
   cd bsc-nexus
   npm install
   # Note: Docker is required for database and Redis
   docker compose up -d db redis
   npm run prisma:migrate
   npm run dev
   ```

2. The server should be running on `http://localhost:3000`

#### Option 2: Test Against Remote BSC Nexus Server

Configure the `.env` file to point to a remote BSC Nexus instance (see Configuration below).

### Running the QA Tests

1. **Copy the environment configuration:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and configure your settings:**
   - Set `SERVER_URL` to your BSC Nexus server URL
   - Set `API_KEY` to a valid API key from your BSC Nexus database
   - Set `ADMIN_TOKEN` to match your BSC Nexus admin token
   - (Optional) Set `DATABASE_URL` to test database connectivity

3. **Run the test suite:**
   ```bash
   npm test
   ```

4. **View the HTML report:**
   - Open `test-report.html` in your browser after tests complete
   - The report includes ✅/❌ indicators and fix suggestions

## ⚙️ Configuration

Edit `.env` to configure the test suite:

```env
# BSC Nexus Server Configuration
SERVER_URL=http://localhost:3000
WS_URL=ws://localhost:3000

# Authentication Tokens
ADMIN_TOKEN=admin
API_KEY=dev-key-123

# Database Configuration (optional, for indexer validation)
DATABASE_URL=postgresql://user:password@localhost:5432/bsc_nexus

# Test Configuration
WEBHOOK_TEST_URL=https://webhook.site/your-unique-id
BUSD_TOKEN_ADDRESS=0xe9e7cea3dedca5984780bafc599bd69add087d56

# Timeout Settings (milliseconds)
REQUEST_TIMEOUT=10000
WEBSOCKET_TIMEOUT=5000
```

### Getting a Valid API Key

The QA suite requires a valid API key from the BSC Nexus database:

1. **Option A - Use the default test key:**
   - If BSC Nexus was seeded with test data, use: `API_KEY=dev-key-123`

2. **Option B - Create a new API key:**
   - Run the seed script in BSC Nexus: `node scripts/seed.mjs`
   - Or create one via the admin panel: `http://localhost:3000/admin/keys`

3. **Option C - Generate manually:**
   - Create an API key in the BSC Nexus database
   - Use the plain-text key in your `.env` file (BSC Nexus hashes it with SHA256)

## 📊 Understanding Test Results

### Console Output

Tests output colored results in the console:
- ✅ Green checkmark = Test passed
- ❌ Red X = Test failed
- 💡 Blue suggestions = How to fix failures

### HTML Report

The HTML report (`test-report.html`) provides:
- Visual summary with pass/fail statistics
- Tests grouped by category
- Detailed error messages and stack traces
- Actionable suggestions for fixing failures
- Response times for each test

## 🐛 Troubleshooting

### "Connection refused" errors

**Problem**: Cannot connect to BSC Nexus server

**Solutions**:
1. Verify BSC Nexus is running: `curl http://localhost:3000/health`
2. Check `SERVER_URL` in `.env` matches your server
3. Ensure no firewall is blocking the connection

### "Invalid API key" errors

**Problem**: API key authentication failing

**Solutions**:
1. Verify the API key exists in the BSC Nexus database
2. Check the key is active: `active = true`
3. Ensure you're using the plain-text key (not the SHA256 hash)
4. Run the seed script to create test keys: `node bsc-nexus/scripts/seed.mjs`

### "Database connection" errors

**Problem**: Cannot connect to PostgreSQL

**Solutions**:
1. Verify `DATABASE_URL` in `.env` is correct
2. Check PostgreSQL is running: `docker ps | grep postgres`
3. Ensure database exists: `bsc_nexus`
4. Skip database tests by removing `DATABASE_URL` from `.env`

### "TokenTransfer table not found" errors

**Problem**: Database schema not initialized

**Solutions**:
1. Run Prisma migrations: `cd bsc-nexus && npm run prisma:migrate`
2. Verify migrations completed successfully
3. Check Prisma schema matches database

### WebSocket timeout errors

**Problem**: WebSocket connection times out

**Solutions**:
1. Increase `WEBSOCKET_TIMEOUT` in `.env`
2. Verify WebSocket server is initialized in BSC Nexus
3. Check for proxy/firewall blocking WebSocket connections

## 📁 Project Structure

```
bsc-nexus-qa-suite/
├── src/
│   ├── config.ts              # Configuration loader
│   ├── types.ts               # TypeScript type definitions
│   ├── test-runner.ts         # Main test orchestrator
│   ├── report-generator.ts    # HTML report generator
│   └── tests/
│       ├── health.ts          # Health & metrics tests
│       ├── rpc.ts             # RPC proxy tests
│       ├── tokens.ts          # Token API tests
│       ├── graphql.ts         # GraphQL tests
│       ├── websocket.ts       # WebSocket tests
│       ├── webhooks.ts        # Webhook tests
│       ├── security.ts        # Security & auth tests
│       └── database.ts        # Database & indexer tests
├── bsc-nexus/                 # BSC Nexus codebase (to be tested)
├── package.json
├── tsconfig.json
├── .env.example
└── test-report.html           # Generated after test run
```

## 🔧 Development

### Adding New Tests

1. Create a new test file in `src/tests/`
2. Export an async function that returns `TestResult[]`
3. Import and call it from `src/test-runner.ts`

Example:
```typescript
import { TestConfig, TestResult } from '../types.js';

export async function testNewFeature(config: TestConfig): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  const start = Date.now();
  try {
    // Your test logic here
    results.push({
      name: 'Test name',
      category: 'Category',
      passed: true,
      duration: Date.now() - start,
      details: 'Test passed successfully',
    });
  } catch (error: any) {
    results.push({
      name: 'Test name',
      category: 'Category',
      passed: false,
      duration: Date.now() - start,
      error: error.message,
      suggestion: 'How to fix this error',
    });
  }
  
  return results;
}
```

## 📝 Notes

### Replit Environment Limitations

This QA suite can run in Replit, but **BSC Nexus itself cannot run in Replit** because:
- Docker is not available (required for PostgreSQL and Redis)
- BSC Nexus requires Docker Compose to set up infrastructure

**Workarounds**:
1. Run BSC Nexus locally and test against it
2. Deploy BSC Nexus to a server and point the QA suite to it
3. Use Replit's built-in PostgreSQL (requires BSC Nexus code modifications)

### API Key Format

BSC Nexus stores API keys as SHA256 hashes, but the QA suite uses the plain-text key. The authentication middleware hashes the key before comparing it to the database.

## 📄 License

MIT License - See BSC Nexus project for details

# BSC Nexus QA Suite - Quick Start Guide

## 🎯 What You Have

You now have a **comprehensive automated QA testing suite** that validates all features of the BSC Nexus backend platform.

## ✅ What's Included

### Test Coverage
- ✅ Health & Metrics endpoints
- ✅ JSON-RPC Proxy (BSC mainnet)
- ✅ Token Information API
- ✅ GraphQL queries
- ✅ WebSocket subscriptions
- ✅ Webhook lifecycle (create/test/delete)
- ✅ Security & authentication
- ✅ Database & indexer validation

### Test Features
- Automated execution of all tests
- Color-coded console output
- Detailed error messages
- Actionable fix suggestions
- Beautiful HTML reports
- Performance metrics

## 🚀 How to Use

### Step 1: Configure the Test Suite

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and set your BSC Nexus server details:
```env
SERVER_URL=http://localhost:3000
API_KEY=dev-key-123
ADMIN_TOKEN=admin
```

### Step 2: Ensure BSC Nexus is Running

**IMPORTANT**: The QA suite needs a running BSC Nexus server to test.

#### Option A: Local Server (Recommended for Development)
```bash
cd bsc-nexus
npm install
docker compose up -d db redis
npm run prisma:migrate
npm run dev
```

#### Option B: Remote Server
Point `SERVER_URL` in `.env` to your deployed BSC Nexus instance.

### Step 3: Run the Tests

```bash
npm test
```

### Step 4: View Results

- **Console**: Colored output with ✅/❌ indicators
- **HTML Report**: Open `test-report.html` in your browser

## 📊 Understanding Results

### Test Status Indicators

- ✅ **Green checkmark** = Test passed
- ❌ **Red X** = Test failed
- 💡 **Blue lightbulb** = Fix suggestion
- ⚠️ **Yellow warning** = Error details

### Example Output

```
▶ Running Health Checks tests...
  ✅ GET /health endpoint (15ms)
     ℹ Health check returned { ok: true }
  
  ✅ GET /metrics endpoint (8ms)
     ℹ Prometheus metrics returned successfully
```

### Common Failures

**"Connection Refused"**
- BSC Nexus server is not running
- Check `SERVER_URL` in `.env`

**"Invalid API key"**
- API key doesn't exist in database
- Run seed script: `node bsc-nexus/scripts/seed.mjs`

**"Database connection failed"**
- PostgreSQL not running
- Check `DATABASE_URL` in `.env`

## 🔧 Advanced Usage

### Running Specific Test Categories

Edit `src/test-runner.ts` and comment out test suites you don't need:

```typescript
const testSuites = [
  { name: 'Health Checks', fn: () => testHealth(config) },
  // { name: 'RPC Proxy', fn: () => testRPC(config) },  // Commented out
  // ... other tests
];
```

### Customizing Timeouts

Edit `.env`:
```env
REQUEST_TIMEOUT=20000    # 20 seconds
WEBSOCKET_TIMEOUT=10000  # 10 seconds
```

### Adding Custom Tests

1. Create a new file: `src/tests/my-test.ts`
2. Export an async function that returns `TestResult[]`
3. Import and add to `src/test-runner.ts`

## 📁 Project Structure

```
.
├── src/
│   ├── test-runner.ts       # Main test orchestrator
│   ├── report-generator.ts  # HTML report generator
│   ├── config.ts            # Configuration loader
│   ├── types.ts             # TypeScript definitions
│   └── tests/               # Individual test modules
│       ├── health.ts
│       ├── rpc.ts
│       ├── tokens.ts
│       ├── graphql.ts
│       ├── websocket.ts
│       ├── webhooks.ts
│       ├── security.ts
│       └── database.ts
├── bsc-nexus/               # BSC Nexus codebase (what we test)
├── package.json
├── tsconfig.json
├── .env.example
└── test-report.html         # Generated after test run
```

## 🐛 Troubleshooting

### Tests Always Fail

1. **Check server is running**: `curl http://localhost:3000/health`
2. **Verify API key**: Ensure it exists in BSC Nexus database
3. **Check configuration**: Review all settings in `.env`

### Database Tests Fail

1. **PostgreSQL running?**: `docker ps | grep postgres`
2. **Migrations applied?**: `cd bsc-nexus && npm run prisma:migrate`
3. **Correct DATABASE_URL?**: Check connection string format

### WebSocket Tests Timeout

1. **Increase timeout**: Set `WEBSOCKET_TIMEOUT=10000` in `.env`
2. **Check WebSocket server**: Verify BSC Nexus initialized WebSocket
3. **Firewall/proxy?**: Ensure WebSocket connections aren't blocked

## 💡 Tips

- Run tests after every BSC Nexus deployment
- Use HTML reports for stakeholder reviews
- Set up CI/CD to run tests automatically
- Monitor test duration to catch performance regressions
- Keep test environment separate from production

## 🔒 Important Notes

### Replit Limitations

- ⚠️ **BSC Nexus cannot run in Replit** (requires Docker)
- ✅ **QA suite CAN run in Replit** (connects to external server)

### API Keys

- Use plain-text keys in `.env`, not SHA256 hashes
- BSC Nexus hashes keys automatically on lookup
- Default test key: `dev-key-123` (if seeded)

### Security

- Never commit real API keys to version control
- Use `.env` file for local configuration only
- For CI/CD, use environment variables

## 📞 Need Help?

- Read the full [README.md](./README.md)
- Check [replit.md](./replit.md) for project documentation
- Review individual test files for implementation details

## ✨ Next Steps

1. Run the tests against your BSC Nexus server
2. Review the HTML report
3. Fix any failing tests
4. Set up automated testing in your CI/CD pipeline
5. Add custom tests for your specific use cases

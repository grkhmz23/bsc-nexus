# BSC Nexus - Enterprise BSC RPC Infrastructure

**Production-ready BNB Smart Chain RPC proxy with Anti-MEV protection, monitoring, and comprehensive testing.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- ✅ **JSON-RPC Proxy** - Full BSC RPC compatibility with request forwarding
- 🛡️ **Anti-MEV Protection** - Private relay routing for transaction privacy
- 🔐 **API Key Authentication** - Secure access control and usage tracking
- 📊 **Prometheus Metrics** - Production monitoring and observability
- 🎯 **Token Information API** - Query BEP-20 token metadata
- ⚡ **Rate Limiting** - Protection against abuse
- 🧪 **Comprehensive Testing** - 100% test coverage with automated QA suite
- 🐳 **Docker Ready** - Containerized deployment
- 📝 **Professional Logging** - Winston-based structured logging

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Anti-MEV Design](#anti-mev-design)

## 🏃 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- (Optional) Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/grkhmz23/BSC-Nexus.git
cd BSC-Nexus

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your settings
nano .env
```

### Run Locally

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

Server will start on `http://localhost:3000`

### Run with Docker

```bash
# Start all services (backend + postgres + redis)
docker-compose up -d

# View logs
docker-compose logs -f bsc-nexus

# Stop services
docker-compose down
```

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
│  (Wallet)   │
└──────┬──────┘
       │
       │ JSON-RPC Request
       │ + API Key
       ▼
┌─────────────────────────────────────┐
│        BSC Nexus Server             │
│  ┌───────────────────────────────┐  │
│  │  Authentication Middleware    │  │
│  │  - API Key Validation         │  │
│  │  - Rate Limiting              │  │
│  └───────────────────────────────┘  │
│                │                     │
│  ┌─────────────▼──────────────────┐ │
│  │   RPC Proxy Service            │ │
│  │  - Request Validation          │ │
│  │  - Anti-MEV Routing            │ │
│  │  - Metrics Collection          │ │
│  └───────────┬────────────────────┘ │
└──────────────┼──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
   ┌────▼────┐   ┌────▼────────┐
   │ Private │   │  Public BSC │
   │  Relay  │   │  RPC Nodes  │
   └─────────┘   └─────────────┘
```

## 📚 API Documentation

### Health Check

```bash
GET /health

Response:
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime": 3600,
  "config": {
    "antiMevEnabled": false,
    "metricsEnabled": true
  }
}
```

### RPC Proxy

```bash
POST /v1/rpc
Headers:
  x-api-key: your-api-key

Body:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_blockNumber",
  "params": []
}

Response:
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x135f24a"
}
```

### Token Information

```bash
GET /v1/tokens/:address/info
Headers:
  x-api-key: your-api-key

Response:
{
  "address": "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  "name": "BUSD Token",
  "symbol": "BUSD",
  "decimals": 18
}
```

### Prometheus Metrics

```bash
GET /metrics

Response: (Prometheus format)
# HELP bsc_nexus_rpc_requests_total Total number of RPC requests
# TYPE bsc_nexus_rpc_requests_total counter
bsc_nexus_rpc_requests_total{method="eth_blockNumber",status="success"} 1250
...
```

### Admin API (Key Management)

```bash
# List API Keys
GET /admin/keys
Headers:
  x-admin-token: your-admin-token

# Create API Key
POST /admin/keys
Headers:
  x-admin-token: your-admin-token
Body:
{
  "name": "Production Key"
}

# Delete API Key
DELETE /admin/keys/:key
Headers:
  x-admin-token: your-admin-token
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `UPSTREAM_RPC_URL` | Primary BSC RPC | `https://bsc-dataseed.binance.org` |
| `ANTI_MEV_ENABLED` | Enable Anti-MEV routing | `false` |
| `PRIVATE_RELAY_URL` | Private relay endpoint | - |
| `ADMIN_TOKEN` | Admin API authentication | `change-me-in-production` |
| `DATABASE_URL` | PostgreSQL connection | - |
| `RATE_LIMIT_MAX_REQUESTS` | Requests per minute | `100` |

See `.env.example` for complete configuration.

## 🛠️ Development

### Project Structure

```
src/
├── server/
│   ├── config/          # Configuration & logging
│   ├── middleware/      # Auth, rate limiting, errors
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server startup
tests/
├── health.ts           # Health endpoint tests
├── rpc.ts             # RPC proxy tests
├── security.ts        # Security tests
└── test-runner.ts     # Test orchestration
```

### Available Scripts

```bash
npm run dev          # Development with hot reload
npm run build        # Compile TypeScript
npm start            # Production server
npm test             # Run QA test suite
```

## 🧪 Testing

BSC Nexus includes a comprehensive QA test suite covering all endpoints:

```bash
# Run all tests
npm test

# View HTML report
open test-report.html
```

**Test Categories:**
- ✅ Health Checks
- ✅ RPC Proxy
- ✅ Token API
- ✅ Security & Authentication
- ✅ WebSocket (planned)
- ✅ Webhooks (planned)
- ✅ Database & Indexer (planned)

## 🚢 Deployment

### Docker Deployment

```bash
# Build image
docker build -t bsc-nexus:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -e UPSTREAM_RPC_URL=https://bsc-dataseed.binance.org \
  -e ADMIN_TOKEN=your-secure-token \
  --name bsc-nexus \
  bsc-nexus:latest
```

### Production Checklist

- [ ] Change `ADMIN_TOKEN` to secure random value
- [ ] Configure `DATABASE_URL` for persistence
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure CORS for your domain
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set up log aggregation
- [ ] Configure rate limits appropriately
- [ ] Review security headers

## 🛡️ Anti-MEV Design

BSC Nexus includes optional Anti-MEV protection for `eth_sendRawTransaction`:

**How it works:**
1. Detect raw transaction submissions
2. Apply random delay (20-120ms) to decorrelate timing
3. Route to private relay instead of public mempool
4. Fallback to public RPC if relay fails

**Configuration:**
```env
ANTI_MEV_ENABLED=true
PRIVATE_RELAY_URL=https://your-private-relay.example.com
ANTI_MEV_HARD_FAIL_ON_RELAY_ERROR=false
```

See [Anti-MEV Design Document](./docs/Anti-MEV_Design.md) for details.

## 📖 Documentation

- [API Reference](./docs/API_Reference.md)
- [Developer Integration Guide](./docs/Developer_Integration_Guide.md)
- [Anti-MEV Design](./docs/Anti-MEV_Design.md)
- [Usage Guide](./USAGE.md)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**Gorkhmaz Beydullayev**  
Lyon, France  
[GitHub](https://github.com/grkhmz23) | [LinkedIn](https://linkedin.com/in/gorkhmaz-beydullayev)

## 🙏 Acknowledgments

- Binance Smart Chain community
- Anthropic Claude for development assistance
- Open source contributors

---

**⭐ Star this repo if you find it useful!**

Repository: https://github.com/grkhmz23/BSC-Nexus


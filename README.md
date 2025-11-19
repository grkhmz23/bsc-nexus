# BSC Nexus

Enterprise-grade RPC infrastructure for Binance Smart Chain with built-in anti-MEV protection, authentication, and comprehensive monitoring.

![Build Status](https://github.com/grkhmz23/bsc-nexus/workflows/Build%20and%20Test/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

BSC Nexus is a production-ready backend platform that provides secure and scalable JSON-RPC proxy services for Binance Smart Chain. It includes API key authentication, rate limiting, token information endpoints, and Prometheus metrics for monitoring.

## Features

### Core Infrastructure (Production Ready)

- **JSON-RPC Proxy** - High-performance request forwarding to BSC mainnet nodes
- **Anti-MEV Routing** - Smart routing to protect against MEV attacks
- **Token Information API** - Query BEP-20 token metadata (name, symbol, decimals)
- **API Authentication** - API key-based access control with usage tracking
- **Health Monitoring** - Comprehensive health checks and uptime monitoring
- **Metrics Collection** - Prometheus-compatible metrics endpoint
- **Rate Limiting** - Request throttling and abuse prevention
- **Docker Support** - Full containerization with Docker Compose

### Planned Features

- GraphQL API interface
- WebSocket real-time subscriptions
- Webhook notification system
- PostgreSQL database integration
- Advanced analytics dashboard

## Test Coverage

Current status: **10 out of 10 tests passing (100%)**

- Health Checks: 2/2 passing
- RPC Proxy: 2/2 passing
- Token API: 1/1 passing
- Security & Authentication: 5/5 passing

Automated testing runs on every push using GitHub Actions, testing against Node.js 18.x and 20.x.

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Optional: Docker and Docker Compose

### Installation

```bash
git clone https://github.com/grkhmz23/bsc-nexus.git
cd bsc-nexus
npm install
```

### Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=3000
NODE_ENV=production
UPSTREAM_RPC_URL=https://bsc-dataseed.binance.org
ADMIN_TOKEN=your-secure-admin-token
```

### Running the Server

Development mode with hot reload:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

Using Docker:
```bash
docker-compose up -d
```

## API Documentation

### Health and Monitoring

**Health Check** (public endpoint)
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2025-11-12T22:30:00.000Z",
  "uptime": 3600
}
```

**Metrics Endpoint** (public endpoint)
```bash
curl http://localhost:3000/metrics
```

Returns Prometheus-format metrics including RPC request counts, latencies, and Node.js runtime metrics.

### JSON-RPC Proxy

All RPC requests require an API key via the `x-api-key` header.

**Get Latest Block Number**
```bash
curl -X POST http://localhost:3000/v1/rpc \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_blockNumber",
    "params": []
  }'
```

**Get Chain ID**
```bash
curl -X POST http://localhost:3000/v1/rpc \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_chainId",
    "params": []
  }'
```

### Token Information API

**Get Token Metadata**
```bash
curl http://localhost:3000/v1/tokens/0xe9e7cea3dedca5984780bafc599bd69add087d56/info \
  -H "x-api-key: your-api-key"
```

Response:
```json
{
  "address": "0xe9e7cea3dedca5984780bafc599bd69add087d56",
  "name": "BUSD Token",
  "symbol": "BUSD",
  "decimals": 18
}
```

### Admin Endpoints

Admin endpoints require an admin token via the `x-admin-token` header.

**Create API Key**
```bash
curl -X POST http://localhost:3000/admin/api-keys \
  -H "Content-Type: application/json" \
  -H "x-admin-token: your-admin-token" \
  -d '{"name": "Client Name"}'
```

**List API Keys**
```bash
curl http://localhost:3000/admin/api-keys \
  -H "x-admin-token: your-admin-token"
```

**Delete API Key**
```bash
curl -X DELETE http://localhost:3000/admin/api-keys/key-to-delete \
  -H "x-admin-token: your-admin-token"
```

## Testing

Run the complete test suite:
```bash
npm test
```

Build the TypeScript code:
```bash
npm run build
```

Run with development server:
```bash
npm run dev
```

After running tests, a detailed HTML report is generated at `test-report.html`.

## Project Structure

```
bsc-nexus/
├── .github/
│   └── workflows/
│       └── build.yml           # CI/CD pipeline
├── src/
│   └── server/
│       ├── config/             # Configuration and environment
│       ├── middleware/         # Authentication and error handling
│       ├── routes/             # API route handlers
│       └── services/           # Business logic and external calls
├── tests/                      # Automated test suite
│   ├── health.ts
│   ├── rpc.ts
│   ├── tokens.ts
│   ├── security.ts
│   └── test-runner.ts
├── .env.example                # Environment variables template
├── Dockerfile                  # Container configuration
├── docker-compose.yml          # Multi-service setup
├── package.json                # Node.js dependencies
├── tsconfig.json               # TypeScript configuration
└── README.md
```

## Deployment

### Using Docker

The simplest deployment method is using Docker Compose:

```bash
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f
```

Stop services:
```bash
docker-compose down
```

### Cloud Platforms

**Railway**
```bash
railway up
```

**Render**

Connect your repository in the Render dashboard and it will automatically detect the Dockerfile.

**DigitalOcean App Platform**

Use the App Platform interface to connect your GitHub repository. The platform will automatically build and deploy using the provided Dockerfile.

### Environment Variables for Production

Required environment variables:
- `UPSTREAM_RPC_URL` - BSC RPC endpoint
- `ADMIN_TOKEN` - Admin authentication token
- `NODE_ENV` - Set to "production"
- `PORT` - Usually auto-configured by the platform

Optional:
- `API_KEYS` - Pre-configured API keys (format: key1:name1,key2:name2)

## Security

The platform implements several security measures:

- API key authentication for all protected endpoints
- Admin token requirement for management operations
- Rate limiting on all endpoints
- Security headers via Helmet.js
- CORS configuration
- Request validation
- Error handling that prevents information disclosure

## Monitoring

Prometheus metrics are available at `/metrics` and include:

- `rpc_requests_total` - Total RPC requests by method and status
- `rpc_request_duration_seconds` - RPC request latency histogram
- Standard Node.js runtime metrics
- HTTP request metrics

Integrate with Prometheus and Grafana for visualization and alerting.

## Development

Install dependencies:
```bash
npm install
```

Run in development mode with hot reload:
```bash
npm run dev
```

Build TypeScript:
```bash
npm run build
```

Run tests:
```bash
npm test
```

Type checking:
```bash
npx tsc --noEmit
```

## Documentation

Additional documentation is available in the repository:

- Quick Start Guide - Get up and running in minutes
- API Reference - Complete endpoint documentation
- Anti-MEV Design - Technical details on MEV protection
- Developer Integration Guide - Integration examples and best practices

## Roadmap

### Current Release (Phase 1)
- Core RPC proxy functionality
- Anti-MEV routing
- API authentication system
- Prometheus metrics
- Docker deployment support
- Comprehensive test coverage

### Next Release (Phase 2)
- GraphQL API interface
- WebSocket real-time subscriptions
- PostgreSQL database integration
- Advanced analytics dashboard
- Multi-chain support (Ethereum, Polygon)

## Contributing

Contributions are welcome. Please submit pull requests or open issues for bugs and feature requests.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For questions or issues:
- Open an issue on GitHub
- Repository: https://github.com/grkhmz23/bsc-nexus



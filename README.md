# BSC-NEXUS

Enterprise-grade JSON-RPC infrastructure for Binance Smart Chain with anti-MEV routing, operational observability, and secure access control.

## Table of Contents
- [Introduction](#introduction)
- [Core Capabilities](#core-capabilities)
- [Architecture](#architecture)
- [Security Model](#security-model)
- [Monitoring and Reliability](#monitoring-and-reliability)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Docker Deployment](#docker-deployment)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Project Layout](#project-layout)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Additional Documentation](#additional-documentation)

## Introduction
BSC-NEXUS is a production-ready backend for serving Binance Smart Chain RPC traffic. It combines high-performance proxying with authentication, rate limiting, and built-in protection against MEV vectors. The service exposes health, metrics, and token intelligence endpoints to support operational teams.

## Core Capabilities
- **JSON-RPC proxy** with upstream failover and request validation.
- **Anti-MEV routing** to reduce exposure to frontrunning and sandwich attacks.
- **API key authentication** with admin-managed lifecycle endpoints.
- **Rate limiting** and abuse protection tuned for public-facing APIs.
- **Token intelligence API** for BEP-20 metadata (name, symbol, decimals).
- **Observability** via Prometheus-compatible metrics and health checks.
- **Container-first delivery** using Docker and Docker Compose.

## Architecture
The service runs as a Node.js/TypeScript application. Major components include:
- **Routing layer**: Express-based router handling `/v1/rpc`, token info, and admin endpoints.
- **Middleware**: API key verification, admin token enforcement, error handling, rate limiting, and request shaping.
- **Services**: Upstream RPC forwarding with anti-MEV logic and token metadata resolution.
- **Observability**: Health and Prometheus metrics endpoints exposing RPC performance, error rates, and runtime metrics.
- **Persistence**: Ephemeral runtime; pluggable database integration planned for future phases.

## Security Model
- API access is protected by API keys provided via the `x-api-key` header.
- Administrative actions (creating, listing, deleting keys) require an `x-admin-token` header.
- Rate limiting and input validation are enforced across public endpoints.
- Security headers and CORS safeguards are configured for hosted deployments.

## Monitoring and Reliability
- `/health` exposes readiness and uptime signals for load balancers.
- `/metrics` provides Prometheus-format metrics including RPC request totals, latency histograms, and Node.js runtime metrics.
- Detailed HTML test reports are written to `test-report.html` after running the suite.

## Quick Start
1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/grkhmz23/bsc-nexus.git
   cd bsc-nexus
   npm install
   ```
2. Copy and adjust environment variables:
   ```bash
   cp .env.example .env
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```

## Configuration
Key environment variables:
- `PORT`: Service port (default: 3000).
- `NODE_ENV`: `development` or `production`.
- `UPSTREAM_RPC_URL`: Binance Smart Chain RPC endpoint.
- `ADMIN_TOKEN`: Secret required for admin endpoints.
- `API_KEYS`: Optional comma-separated `key:name` entries for pre-provisioned clients.

## Running Locally
- **Development** with hot reload: `npm run dev`
- **Production build**: `npm run build` followed by `npm start`

## Docker Deployment
Use Docker Compose for a consistent runtime:
```bash
docker-compose up -d
```
- View logs: `docker-compose logs -f`
- Stop services: `docker-compose down`

Cloud platforms such as Render, Railway, and DigitalOcean App Platform can deploy directly from the Dockerfile with minimal changes.

## API Overview
- **Health**: `GET /health`
- **Metrics**: `GET /metrics`
- **JSON-RPC Proxy**: `POST /v1/rpc` (requires `x-api-key`)
- **Token Metadata**: `GET /v1/tokens/{address}/info` (requires `x-api-key`)
- **Admin**: `POST /admin/api-keys`, `GET /admin/api-keys`, `DELETE /admin/api-keys/{key}` (requires `x-admin-token`)

Detailed request/response examples are available in the accompanying documentation set.

## Testing
Run the TypeScript tests:
```bash
npm test
```
Build verification:
```bash
npm run build
```
Type checking without emit:
```bash
npx tsc --noEmit
```

## Project Layout
```
bsc-nexus/
├── src/                  # Application source (server, middleware, routes, services)
├── tests/                # Automated test suite with HTML reporting
├── prisma/               # Prisma schema (database integration planned)
├── docker-compose.yml    # Container orchestration
├── Dockerfile            # Service image
├── .env.example          # Environment template
└── README.md
```

## Future Roadmap
- **Data layer**: PostgreSQL-backed persistence for API keys, quotas, and analytics.
- **Multi-chain support**: Extend proxying and MEV protection to Ethereum, Polygon, and other chains.
- **Realtime interfaces**: WebSocket subscriptions for transaction and block events.
- **GraphQL gateway**: Schema-driven access to RPC and token intelligence.
- **Operational console**: Web dashboard for usage analytics, alerting, and key management.
- **Webhooks**: Event-driven callbacks for transaction status and monitoring alerts.

## Contributing
Issues and pull requests are welcome. Please open an issue to discuss substantial changes before submitting a PR.

## License
Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## Additional Documentation
- [Quick Start Guide](QUICKSTART.md)
- [Usage Guide](USAGE.md)
- [Developer Integration Guide](Developer%20Integration%20Guide%20%E2%80%93%20BSC%20Nexus)
- [Anti-MEV Design](Anti-MEV%20Design%20%E2%80%93%20BSC%20Nexus)
- [API Reference](API%20Reference%20%E2%80%93%20BSC%20Nexus)
- [Production Runbook](PRODUCTION_README.md)

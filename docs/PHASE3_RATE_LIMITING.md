# Phase 3 – Rate Limiting & Observability

## Overview
BSC Nexus now enforces per-API-key request limits over a rolling 60-second window. Each authenticated request consumes one slot from the key's bucket. When the bucket reaches the configured threshold the request is rejected immediately and the usage logger is **not** invoked, so only successful (non-rate-limited) calls appear in long-term usage analytics.

## Configuration
Global defaults live in `src/server/config/env.ts` and can be overridden with environment variables:

| Variable | Description | Default |
| --- | --- | --- |
| `DEFAULT_RATE_LIMIT_PER_MINUTE` | Per-key requests per 60 seconds when no override is set on the key | `RATE_LIMIT_MAX_REQUESTS` (100) |
| `RATE_LIMIT_BURST_FACTOR` | Multiplier applied to the per-minute limit to allow small bursts | `1` |

Individual API keys can override the limit through the `rateLimitPerMinute` field. When set, the override completely replaces the global default for that key.

## Error Responses
Clients receive channel-appropriate responses when the limit is exceeded:

- **RPC (`/v1/rpc`)** – JSON-RPC error payload `{ code: -32004, message: "Rate limit exceeded" }` with HTTP 429.
- **REST (`/v1/tokens/:address/info` and other RESTful routes)** – JSON `{ "error": { "code": 429, "message": "Rate limit exceeded" } }` with HTTP 429.

## Observability & Operations
Operators can inspect limits and recent activity via the admin API (all require `x-admin-token`):

- `GET /admin/api-keys/:id/limits` – Returns the effective limit (global + per-key overrides) and an in-memory snapshot of the current window (count, remaining, reset timestamp).
- `GET /admin/usage/recent?limit=50&apiKeyId=...` – Lists the most recent `ApiUsage` rows ordered by timestamp, optionally filtered by key or since a specific timestamp.
- `GET /admin/usage/errors` – Same as `recent` but only entries where `statusCode >= 400` to highlight integrations that are failing.

These snapshots are best-effort because the rate-limit counters are currently stored in-memory. For production, plug the `rateLimitService` into a shared cache (e.g., Redis) to provide cross-instance enforcement while retaining the same interfaces.

BSC Nexus – QA and RPC Infrastructure Framework
Overview

BSC Nexus is a modular backend and quality assurance framework designed to test and validate blockchain RPC infrastructure.
It provides a structured environment for verifying API reliability, measuring performance, and integrating with real Binance Smart Chain (BSC) RPC nodes.

The current version includes a fully functional mock backend with /health and /rpc endpoints, automated testing scripts, and live integration with Binance Smart Chain public nodes for token-related checks.

Repository: https://github.com/grkhmz23/BSC-Nexus

Features
Component	Description
Mock Backend	Express-based local server implementing /health and /rpc routes for QA simulation.
QA Test Suite	TypeScript-based automated test framework for validating all core endpoints.
Health Check Test	Confirms backend availability and response integrity.
RPC Test	Validates JSON-RPC request and response structure using the /rpc endpoint.
Token RPC Test	Connects to the live Binance Smart Chain RPC node to confirm valid balance and token data responses.
Reporting	Generates detailed HTML test reports for documentation and verification.
Environment Configuration	Uses .env for managing server URLs, WebSocket endpoints, and database connection strings.
Repository Structure
bsc-nexus/
│
├─ src/                     # Backend source (future integration)
├─ tests/                   # Automated test suite
│   ├─ health.ts
│   ├─ rpc.ts
│   └─ tokens.ts
│
├─ mock-server.mjs          # Express mock backend
├─ package.json
├─ tsconfig.json
├─ .env.example
├─ test-report.html          # Generated QA test report
└─ README.md

Quick Start
Requirements

Node.js 18+

npm

Installation
git clone https://github.com/grkhmz23/BSC-Nexus.git
cd BSC-Nexus
npm install

Run Mock Backend
node mock-server.mjs

Execute Tests

In a new terminal:

npm test


After completion, a report will be generated at:

test-report.html

Test Verification

All current tests have been executed and verified in GitHub Codespaces.
The following results were achieved during the final validation:

Test Summary
------------
Total Tests:  4
Passed:       4 (100.0%)
Failed:       0 (0.0%)
Duration:     0.47s


All systems are operational. The mock backend, RPC test logic, and Binance Smart Chain integration are confirmed functional.

Environment Variables

Example configuration (.env.example):

SERVER_URL=https://your-public-url.app.github.dev
WS_URL=wss://your-public-url.app.github.dev
DATABASE_URL=postgres://user:password@localhost:5432/bsc_nexus
BSC_RPC_URL=https://bsc-dataseed.binance.org

Future Development

Planned next steps:

Implement live RPC proxy forwarding to BSC mainnet nodes.

Add database integration for request logging and analytics.

Deploy production API with authentication and API key management.

Integrate automated QA reporting in CI/CD pipeline.

Expand test coverage for webhooks, security headers, and database connectivity.

License

This project is released under the MIT License.

Repository: https://github.com/grkhmz23/BSC-Nexus

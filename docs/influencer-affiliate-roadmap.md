# Influencer Dashboard & Affiliate Platform — Roadmap

Version: Phase 1 (Core Backend + Dashboard MVP)
Created: 2025-10-10
Scope: Custom Web3 affiliate platform with tracking, attribution, and a payout engine, plus an influencer dashboard.

## Overview

Phase 1 goal: build the core affiliate engine, wallet attribution, and a dashboard MVP for creators. Start with the MOT token and expand to support multiple tokens later.

---

## Milestone 1 — Architecture & Setup (In-progress)

Epic: Establish the core technical foundation.

Deliverables:

- Architecture diagram (services, database, events, queues, dashboard)
- Repository / monorepo layout, README, linting and formatting config
- Environment patterns and CI/CD templates
- Database migrations for core tables
- Wallet binding and referral ID design
- Event schema for referral → conversion → payout flow

Acceptance criteria:

- Architecture diagram and short design document reviewed
- Repositories or monorepo packages created with README and lint configuration
- CI runs lint/test on a sample PR
- Migrations run locally and produce the expected schema

Subtasks:

- Define system architecture: PNG/SVG diagram and short design doc (services, boundaries, dataflow)
- Repository and monorepo setup: create backend `affiliate-engine`, `influencer-dashboard`, and `admin-console` packages
- Environments & CI/CD: GitHub Actions templates for build/test/deploy
- Database schema design & migrations (Postgres): affiliates, affiliate_wallets, referral_links, referral_clicks, referrals, payouts, campaigns, creatives, events, fraud_flags, balances
- Wallet binding & referral ID logic: cookie/localStorage + on-chain signature approach; API endpoints
- Event schema & message format: JSON schemas and idempotency key strategy
- Local dev setup & docs: `docker-compose` for Postgres and a developer onboarding README

---

## Milestone 2 — Core Affiliate Engine

Epic: Build tracking, attribution, APIs, and anti-fraud systems.

Scope and subtasks:

- Referral link generation and redirects (short links capturing UTM-like metadata)
- Store and attribute clicks and conversions (first-touch / last-touch rules, wallet-bind precedence)
- Affiliate APIs: stats, referral history, payouts (paginated, auth-protected)
- Anti-fraud checks: duplicate wallet detection, self-referral prevention, IP heuristics, burst detection
- Admin scripts and E2E simulations to validate end-to-end flows

Acceptance:

- Endpoints function with test scripts, attribution follows the spec, fraud cases are flagged and recorded

---

## Milestone 3 — Influencer Dashboard MVP

Epic: Deliver the influencer-facing dashboard for onboarding and earnings visibility.

Scope and subtasks:

- Wallet authentication and onboarding (SIWE / EIP-4361)
- Dashboard UI showing stats, earnings, conversion metrics
- Referral link generator and creative asset manager (upload and attach creatives)
- Payout views: balances, pending payouts, and a request-payout flow (MOT initially)

Acceptance:

- A user can sign in with a wallet, view their dashboard, create referral links, and request payouts (simulated)

---

## Milestone 4 — Admin Console & Campaign Management

Epic: Admin tooling for managing affiliates, campaigns, payouts, creatives, and analytics.

Scope and subtasks:

- Admin UI: list, search, and filter affiliates; view wallet bindings, referral history, and fraud flags; suspend or override affiliates
- Campaign types and rules engine: fixed token rewards, percentage-based, tiered rewards, caps and timeframes
- Creative manager and CDN uploads (S3 / Cloudflare R2)
- Payout scheduling and execution (batching, audit logs, manual overrides)
- Performance analytics and reports (CSV export, scheduled reports)

Acceptance:

- Admin can create campaigns, run sample conversions, and process payouts (simulated or real)

---

## Data Contract (Core tables - short)

- `affiliates` (id, slug, display_name, email?, created_at, metadata)
- `affiliate_wallets` (id, affiliate_id, wallet_address, bound_at, source)
- `referral_links` (id, affiliate_id, slug, destination, campaign_id, created_at)
- `referral_clicks` (id, referral_link_id, ip_hash, ua_hash, referrer, ts, metadata)
- `referrals` (id, click_id?, affiliate_id, wallet_address?, conversion_type, amount?, ts, status)
- `payouts` (id, affiliate_id, token, amount, status, scheduled_at, executed_at, tx_hash?, metadata)
- `campaigns` (id, name, type, rules_json, start_at, end_at, cap)
- `fraud_flags` (id, subject_type, subject_id, rule, score, meta, created_at)

Note: consider storing IP and User-Agent hashes rather than raw values to reduce privacy risk.

---

## Event payloads (examples)

- Click event:

  {
    "type": "click",
    "link_slug": "...",
    "ip_hash": "...",
    "ua_hash": "...",
    "referrer": "...",
    "utm": { /* ... */ },
    "ts": "...",
    "idempotency_key": "..."
  }

- Connect event:

  {
    "type": "connect",
    "wallet": "0x...",
    "link_slug": "...",
    "ts": "...",
    "signature": "...",
    "idempotency_key": "..."
  }

- Conversion event:

  {
    "type": "conversion",
    "wallet": "0x...",
    "amount": 123,
    "currency": "MOT",
    "source_event_id": "...",
    "ts": "...",
    "idempotency_key": "..."
  }

- Payout event:

  {
    "type": "payout",
    "affiliate_id": "...",
    "token": "MOT",
    "amount": 123,
    "status": "scheduled|executed",
    "tx_hash": "...",
    "ts": "..."
  }

---

## Suggested tech stack

- Backend: Node.js (TypeScript) with Fastify / NestJS / Express
- Database: Postgres with Prisma / TypeORM / Knex
- Queue (optional): Redis Streams, RabbitMQ, or SQS/Kafka for scale
- Auth: SIWE (EIP-4361) for wallet sign-in; JWT for session tokens
- Frontend dashboard: Next.js + Tailwind CSS (align with MOT branding)
- Storage: S3-compatible (Backblaze/MinIO) or Cloudflare R2
- CI: GitHub Actions

---

## Issue template (copy into Linear / GitHub)

Title: [Milestone 1] Define system architecture

Body:

- Summary: Create a high-level architecture diagram and a short design document

- Acceptance criteria:

  - PNG/SVG diagram saved in `docs/architecture.png`
  - Design doc `docs/architecture.md` explains services and dataflow

- Tech notes / decisions:

  - Use Postgres + Prisma
  - Tracking service as a separate package under `packages/tracking-service`

---

## How to use

1. Save this file to the repository at `docs/influencer-affiliate-roadmap.md` (already done).
2. Create issues/tickets for each subtask and assign priority and estimates.
3. Start with Milestone 1 — convert subtasks into small PRs (architecture, repo setup, migrations).

---

## Recommended next steps

- Create the `affiliate-engine` package and commit a skeleton `package.json` and README.
- Draft `docs/architecture.png` (a rough diagram) and review with the team.
- Generate an initial Prisma schema and migration for the core tables.

---

Created for Holatech developers — use this as the canonical Phase 1 roadmap.
    "referrer": "...",
    "utm": { /* ... */ },
    "ts": "...",
    "idempotency_key": "..."
  }

- Connect event:

  {
    "type": "connect",
    "wallet": "0x...",
    "link_slug": "...",
    "ts": "...",
    "signature": "...",
    "idempotency_key": "..."
  }

- Conversion event:

  {
    "type": "conversion",
    "wallet": "0x...",
    "amount": 123,
    "currency": "MOT",
    "source_event_id": "...",
    "ts": "...",
    "idempotency_key": "..."
  }

- Payout event:

  {
    "type": "payout",
    "affiliate_id": "...",
    "token": "MOT",
    "amount": 123,
    "status": "scheduled|executed",
    "tx_hash": "...",
    "ts": "..."
  }

---

## Suggested tech stack

- Backend: Node.js (TypeScript) with Fastify / NestJS / Express
- Database: Postgres with Prisma / TypeORM / Knex
- Queue (optional): Redis Streams, RabbitMQ, or SQS/Kafka for scale
- Auth: SIWE (EIP-4361) for wallet sign-in; JWT for session tokens
- Frontend dashboard: Next.js + Tailwind CSS (align with MOT branding)
- Storage: S3-compatible (Backblaze/MinIO) or Cloudflare R2
- CI: GitHub Actions

---

## Issue template (copy into Linear / GitHub)

Title: [Milestone 1] Define system architecture

Body:

- Summary: Create a high-level architecture diagram and a short design document

- Acceptance criteria:

  - PNG/SVG diagram saved in `docs/architecture.png`
  - Design doc `docs/architecture.md` explains services and dataflow

- Tech notes / decisions:

  - Use Postgres + Prisma
  - Tracking service as a separate package under `packages/tracking-service`

---

## How to use

1. Save this file to the repository at `docs/influencer-affiliate-roadmap.md` (already done).
2. Create issues/tickets for each subtask and assign priority and estimates.
3. Start with Milestone 1 — convert subtasks into small PRs (architecture, repo setup, migrations).

---

## Recommended next steps

- Create the `affiliate-engine` package and commit a skeleton `package.json` and README.
- Draft `docs/architecture.png` (a rough diagram) and review with the team.
- Generate an initial Prisma schema and migration for the core tables.

---

Created for Holatech developers — use this as the canonical Phase 1 roadmap.
- A user can sign in with a wallet, view their dashboard, create referral links, and request payouts (simulated)

## Milestone 4 — Admin Console & Campaign Management

Epic: Admin tooling for managing affiliates, campaigns, payouts, creatives, and analytics.

Scope and subtasks:

- Admin UI: list, search, and filter affiliates; view wallet bindings, referral history, and fraud flags; suspend or override affiliates
- Campaign types and rules engine: fixed token rewards, percentage-based, tiered rewards, caps and timeframes
- Creative manager and CDN uploads (S3 / Cloudflare R2)
- Payout scheduling and execution (batching, audit logs, manual overrides)
- Performance analytics and reports (CSV export, scheduled reports)

Acceptance:

- Admin can create campaigns, run sample conversions, and process payouts (simulated or real)

---

## Data Contract (Core tables - short)

- `affiliates` (id, slug, display_name, email?, created_at, metadata)
- `affiliate_wallets` (id, affiliate_id, wallet_address, bound_at, source)
- `referral_links` (id, affiliate_id, slug, destination, campaign_id, created_at)
- `referral_clicks` (id, referral_link_id, ip_hash, ua_hash, referrer, ts, metadata)
- `referrals` (id, click_id?, affiliate_id, wallet_address?, conversion_type, amount?, ts, status)
- `payouts` (id, affiliate_id, token, amount, status, scheduled_at, executed_at, tx_hash?, metadata)
- `campaigns` (id, name, type, rules_json, start_at, end_at, cap)
- `fraud_flags` (id, subject_type, subject_id, rule, score, meta, created_at)

Note: consider storing IP and User-Agent hashes rather than raw values to reduce privacy risk.

## Event payloads (example)

- Click event: { "type": "click", "link_slug": "...", "ip_hash": "...", "ua_hash": "...", "referrer": "...", "utm": {...}, "ts": "...", "idempotency_key": "..." }
- Connect event: { "type": "connect", "wallet": "0x...", "link_slug": "...", "ts": "...", "signature": "...", "idempotency_key": "..." }
- Conversion event: { "type": "conversion", "wallet": "0x...", "amount": 123, "currency": "MOT", "source_event_id": "...", "ts": "...", "idempotency_key": "..." }
- Payout event: { "type": "payout", "affiliate_id": "...", "token": "MOT", "amount": 123, "status": "scheduled|executed", "tx_hash": "...", "ts": "..." }

## Suggested tech stack

- Backend: Node.js (TypeScript) with Fastify / NestJS / Express
- Database: Postgres with Prisma / TypeORM / Knex
- Queue (optional): Redis Streams, RabbitMQ, or SQS/Kafka for scale
- Auth: SIWE (EIP-4361) for wallet sign-in; JWT for session tokens
- Frontend dashboard: Next.js + Tailwind CSS (align with MOT branding)
- Storage: S3-compatible (Backblaze/MinIO) or Cloudflare R2
- CI: GitHub Actions

## Issue template (copy into Linear / GitHub)

Title: [Milestone 1] Define system architecture

Body:

- Summary: Create a high-level architecture diagram and a short design document

- Acceptance criteria:

  - PNG/SVG diagram saved in `docs/architecture.png`
  - Design doc `docs/architecture.md` explains services and dataflow

- Tech notes / decisions:

  - Use Postgres + Prisma
  - Tracking service as a separate package under `packages/tracking-service`

## How to use

1. Save this file to the repository at `docs/influencer-affiliate-roadmap.md` (already done).
2. From here, create issues/tickets for each subtask and assign priority and estimates.
3. Start with Milestone 1 — convert subtasks into small PRs (architecture, repo setup, migrations).

## Recommended next steps

- Create the `affiliate-engine` package and commit a skeleton `package.json` and README.
- Draft `docs/architecture.png` (a rough diagram) and review with the team.
- Generate an initial Prisma schema and migration for the core tables.

---

Created for Holatech developers — use this as the canonical Phase 1 roadmap.

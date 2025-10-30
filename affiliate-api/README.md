# Affiliate API (Privy Auth + Wallets)

## Overview
- Unified Web2/Web3 auth via Privy (email, social, SMS, wallets)
- Platform JWT issuance after Privy verification
- Wallet management: list/connect/disconnect/set primary with cooldown
- Swagger: `/api/docs`

## Run (monorepo with pnpm)
```bash
# from repo root
pnpm install
pnpm nx serve @mot-platform/affiliate-api
```
Served at: `http://localhost:{port}/api`

If Nx pruned lockfile errors appear, you can run the package standalone:
```bash
cd affiliate-api
pnpm install
pnpm webpack build
node dist/main.js
```

## Environment variables
- PRIVY_APP_ID
- PRIVY_APP_SECRET
- JWT_SECRET
- PRIMARY_WALLET_COOLDOWN_HOURS (default: 24)
- PORT (default: 8080)

## Endpoints
- POST /api/auth/privy/verify { token }
  - Verifies Privy token, returns `{ accessToken, user }`
- GET /api/wallets (Bearer accessToken)
- POST /api/wallets/connect { address, chainType } (Bearer)
- POST /api/wallets/disconnect { address } (Bearer)
- POST /api/wallets/primary { address } (Bearer)

## Testing flow
1) Sign-in with Privy Web SDK on the frontend, obtain Privy auth token
2) Call `POST /api/auth/privy/verify` with the token
3) Use returned `accessToken` as Bearer for wallet endpoints

## Notes
- Wallet data store is in-memory for POC; replace with DB later
- Primary wallet change is protected by a cooldown window

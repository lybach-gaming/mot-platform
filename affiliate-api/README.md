# Affiliate API

NestJS-based API for the MOT Platform affiliate system with Privy authentication and wallet management.

## Overview
- Unified Web2/Web3 auth via Privy (email, social, SMS, wallets)
- Platform JWT issuance after Privy verification
- Wallet management: list/connect/disconnect/set primary with cooldown
- Analytics and leaderboard features
- Swagger: `/api/docs` (password protected)

## Prerequisites

- Node.js 22.11.0 (use nvm: `nvm use`)
- pnpm
- Docker and Docker Compose (for local development with Redis & PostgreSQL)

## Quick Start with Docker

### 1. Install Docker (on server)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 2. Start Database and Redis

```bash
cd affiliate-api

# Start PostgreSQL and Redis in the background
docker compose up -d

# Check if containers are running
docker compose ps

# View logs
docker compose logs -f
```

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values (update PRIVY keys, JWT secret, etc.)
nano .env
```

## Run (monorepo with pnpm)

```bash
# From repo root - install dependencies
pnpm install

# Build the API
npx nx build affiliate-api

# Run in development mode
npx nx serve affiliate-api
```

Served at: `http://localhost:8085/api`

### Using PM2 for Production

```bash
# Start with PM2
pm2 start "npx nx serve affiliate-api" --name "affiliate-api"
pm2 save
pm2 startup

# View logs
pm2 logs affiliate-api
```

## Environment Variables

Required environment variables (see `.env.example`):

- `PORT` - API port (default: 8085)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PRIVY_APP_ID` - Privy authentication app ID
- `PRIVY_APP_SECRET` - Privy authentication secret
- `JWT_SECRET` - Secret for JWT token signing
- `SWAGGER_PASSWORD` - Password for Swagger documentation
- `PRIMARY_WALLET_COOLDOWN_HOURS` (default: 24)

## API Endpoints

Base URL: `http://localhost:8085/api`

- **Health Check**: `GET /api`
- **Swagger Docs**: `GET /api/docs` (password protected)
- **Auth**: `/api/auth/privy`
  - POST `/api/auth/privy/verify` - Verify Privy token, returns `{ accessToken, user }`
- **User**: `/api/user`
- **Wallets**: `/api/wallets`
  - GET `/api/wallets` (Bearer accessToken)
  - POST `/api/wallets/connect { address, chainType }` (Bearer)
  - POST `/api/wallets/disconnect { address }` (Bearer)
  - POST `/api/wallets/primary { address }` (Bearer)
- **Analytics**: `/api/analytics`
- **Leaderboard**: `/api/leaderboard`
- **Webhooks**: `/api/webhooks/privy`

## Testing Flow

1. Sign-in with Privy Web SDK on the frontend, obtain Privy auth token
2. Call `POST /api/auth/privy/verify` with the token
3. Use returned `accessToken` as Bearer for wallet endpoints

## Database Management

### Connect to PostgreSQL

```bash
# Using docker exec (inside container)
docker exec -it affiliate-postgres psql -U affiliate_user -d affiliate_db

# Or from host using psql client (port 54320)
psql -U affiliate_user -d affiliate_db -h localhost -p 54320
```

### Connect to Redis

```bash
# Using docker exec (inside container)
docker exec -it affiliate-redis redis-cli ping

# Or from host using redis-cli (port 63790)
redis-cli -h localhost -p 63790 ping
```

## Docker Commands

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# Stop and remove all data
docker compose down -v

# View logs
docker compose logs -f postgres
docker compose logs -f redis

# Restart containers
docker compose restart
```

## Troubleshooting

### Check container health

```bash
docker compose ps
```

### Reset database

```bash
docker compose down -v
docker compose up -d
```

### Firewall Configuration

If using UFW, allow the API port:

```bash
sudo ufw allow 8085/tcp
sudo ufw reload
```

## Notes

- Primary wallet change is protected by a cooldown window
- Database tables are auto-created via TypeORM synchronize (development only)

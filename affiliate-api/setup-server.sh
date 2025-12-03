#!/bin/bash
set -e

echo "🚀 Setting up Affiliate API on server..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo apt-get install docker-compose-plugin -y
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    sudo apt-get update
    sudo apt-get install docker-compose-plugin -y
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Navigate to affiliate-api directory
cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created. Please edit it with your values:${NC}"
    echo "  nano .env"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Start Docker containers
echo -e "${YELLOW}Starting PostgreSQL and Redis containers...${NC}"
docker compose up -d

# Wait for containers to be healthy
echo "Waiting for containers to be ready..."
sleep 10

# Check container status
echo -e "${YELLOW}Checking container status...${NC}"
docker compose ps

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
if docker exec affiliate-postgres pg_isready -U affiliate_user -d affiliate_db > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL is still starting up...${NC}"
fi

# Test Redis connection
echo -e "${YELLOW}Testing Redis connection...${NC}"
if docker exec affiliate-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is ready${NC}"
else
    echo -e "${YELLOW}⚠ Redis is still starting up...${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit your .env file with proper values:"
echo "   nano .env"
echo ""
echo "2. Install dependencies (from repo root):"
echo "   cd .."
echo "   pnpm install"
echo ""
echo "3. Build and run the API:"
echo "   npx nx build affiliate-api"
echo "   npx nx serve affiliate-api"
echo ""
echo "Or use PM2 for production:"
echo "   pm2 start \"npx nx serve affiliate-api\" --name \"affiliate-api\""
echo "   pm2 save"
echo ""
echo "API will be available at: http://localhost:8085/api"
echo "Swagger docs: http://localhost:8085/api/docs"
echo ""
echo "To view Docker logs:"
echo "   docker compose logs -f"

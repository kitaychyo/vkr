#!/bin/bash

# Dota 2 Live Predictor - Deploy Script
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}═══ Dota 2 Live Predictor - Deploy ═══${NC}"

# Check .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env from example...${NC}"
    cp .env.example .env
    echo -e "${RED}EDIT .env AND ADD STEAM_API_KEY!${NC}"
    exit 1
fi

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running!${NC}"
    exit 1
fi

echo -e "${GREEN}Building...${NC}"
docker-compose build

echo -e "${GREEN}Starting...${NC}"
docker-compose up -d

echo -e "${YELLOW}Waiting for services...${NC}"
sleep 15

echo -e "${GREEN}═══ Done! ═══${NC}"
echo "Frontend: http://localhost:80"
echo "Backend:  http://localhost:8000"
echo ""
echo "Logs: docker-compose logs -f"

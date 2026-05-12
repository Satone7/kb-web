#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== KB-Web Docker Deploy ===${NC}"

# Check .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env not found, copying from .env.example${NC}"
    cp .env.example .env
    echo -e "${RED}Please edit .env before running again!${NC}"
    exit 1
fi

# Load env
set -a
source .env
set +a

# Validate required vars
if [ -z "$KB_ROOT" ] || [ ! -d "$KB_ROOT" ]; then
    echo -e "${RED}Error: KB_ROOT is not set or directory does not exist${NC}"
    echo "Current KB_ROOT: ${KB_ROOT:-<not set>}"
    exit 1
fi

if [ "$SESSION_SECRET" = "change-me-in-production" ]; then
    echo -e "${YELLOW}Warning: Using default SESSION_SECRET, please change it in .env${NC}"
fi

echo "KB_ROOT: $KB_ROOT"
echo "PORT: ${PORT:-3000}"

# Build and start
echo -e "${GREEN}Building image...${NC}"
docker compose build --no-cache

echo -e "${GREEN}Starting services...${NC}"
docker compose up -d

echo -e "${GREEN}Done!${NC}"
echo "Access: http://localhost:${PORT:-3000}"
echo ""
echo "Logs: docker compose logs -f"
echo "Stop: docker compose down"

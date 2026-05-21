#!/usr/bin/env bash
set -euo pipefail

cd /opt/agendoro-frontend

echo "==> Logging into GHCR"
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

echo "==> Removing old orphan frontend container if exists"
docker rm -f agendoro-frontend 2>/dev/null || true

echo "==> Pulling latest frontend image"
docker compose -f docker-compose.prod.yml pull

echo "==> Starting frontend container"
docker compose -f docker-compose.prod.yml up -d

echo "==> Cleaning dangling images"
docker image prune -af
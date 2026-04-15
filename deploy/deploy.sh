#!/usr/bin/env sh
set -e

GHCR_USERNAME="${GHCR_USERNAME:-mdauri}"

if [ -z "$GHCR_TOKEN" ]; then
  echo "GHCR_TOKEN is not set"
  exit 1
fi

echo "==> Logging into GHCR as $GHCR_USERNAME"
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

cd /opt/agendoro

echo "==> Pulling latest images"
docker compose -f docker-compose.prod.yml pull

echo "==> Starting containers"
docker compose -f docker-compose.prod.yml up -d

echo "==> Cleaning unused images"
docker image prune -f

echo "==> Deployment finished"
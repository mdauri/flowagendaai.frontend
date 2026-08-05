#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/agendoro-frontend}"
COMPOSE_FILE="docker-compose.prod.yml"
RELEASE_ENV_FILE=".release.env"
NEXT_RELEASE_ENV_FILE=".release.env.rollback"
RELEASE_STATE_DIR=".release-state"
CURRENT_RELEASE_FILE="${RELEASE_STATE_DIR}/current.env"
PREVIOUS_RELEASE_FILE="${RELEASE_STATE_DIR}/previous.env"
PRIMARY_CONTAINER="agendoro-frontend"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-https://agenda.dauri.com.br/}"

timestamp_utc() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  printf '%s %s\n' "$(timestamp_utc)" "$*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    fail "required env var missing: ${name}"
  fi
}

login_ghcr_if_configured() {
  if [[ -n "${GHCR_USERNAME:-}" && -n "${GHCR_TOKEN:-}" ]]; then
    log "logging into GHCR"
    echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
    return
  fi

  log "GHCR credentials not provided; continuing with anonymous registry access"
}

read_state_value() {
  local key="$1"
  local file="$2"

  awk -F= -v key="$key" '$1 == key { print substr($0, index($0, "=") + 1); exit }' "$file"
}

write_release_env() {
  local file="$1"
  local image_ref="$2"

  printf 'AGENDORO_FRONTEND_IMAGE=%s\n' "$image_ref" > "$file"
  chmod 600 "$file"
}

write_release_state() {
  local file="$1"
  local image_ref="$2"
  local source="$3"

  cat > "$file" <<EOF
timestamp_utc=$(timestamp_utc)
image_ref=${image_ref}
source=${source}
EOF
  chmod 600 "$file"
}

wait_for_http_ok() {
  local url="$1"
  local attempts="${2:-30}"
  local sleep_seconds="${3:-2}"
  local attempt

  for ((attempt=1; attempt<=attempts; attempt+=1)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$sleep_seconds"
  done

  fail "timed out waiting for healthcheck: ${url}"
}

cd "$APP_DIR"

[[ -f "$PREVIOUS_RELEASE_FILE" ]] || fail "previous release state not found: ${PREVIOUS_RELEASE_FILE}"
target_image_ref="$(read_state_value image_ref "$PREVIOUS_RELEASE_FILE")"
[[ -n "$target_image_ref" ]] || fail "previous release state does not contain image_ref"

current_image_ref=""
if [[ -f "$CURRENT_RELEASE_FILE" ]]; then
  current_image_ref="$(read_state_value image_ref "$CURRENT_RELEASE_FILE")"
fi

write_release_env "$NEXT_RELEASE_ENV_FILE" "$target_image_ref"
docker compose --env-file "$NEXT_RELEASE_ENV_FILE" -f "$COMPOSE_FILE" config >/dev/null

login_ghcr_if_configured

log "pulling rollback target ${target_image_ref}"
docker compose --env-file "$NEXT_RELEASE_ENV_FILE" -f "$COMPOSE_FILE" pull

log "stopping current frontend before rollback"
docker compose --env-file "$NEXT_RELEASE_ENV_FILE" -f "$COMPOSE_FILE" down --remove-orphans || true
if docker ps -a --format '{{.Names}}' | grep -Fxq "$PRIMARY_CONTAINER"; then
  docker rm -f "$PRIMARY_CONTAINER"
fi

mv "$NEXT_RELEASE_ENV_FILE" "$RELEASE_ENV_FILE"

log "starting rollback target"
docker compose --env-file "$RELEASE_ENV_FILE" -f "$COMPOSE_FILE" up -d

wait_for_http_ok "$HEALTHCHECK_URL"

if [[ -n "$current_image_ref" && "$current_image_ref" != "$target_image_ref" ]]; then
  write_release_state "$PREVIOUS_RELEASE_FILE" "$current_image_ref" "pre_rollback_snapshot"
fi
write_release_state "$CURRENT_RELEASE_FILE" "$target_image_ref" "rollback"

log "frontend rollback finished successfully with ${target_image_ref}"

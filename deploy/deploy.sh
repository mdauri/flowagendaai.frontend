#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/agendoro-frontend}"
COMPOSE_FILE="docker-compose.prod.yml"
RELEASE_ENV_FILE=".release.env"
NEXT_RELEASE_ENV_FILE=".release.env.next"
RELEASE_STATE_DIR=".release-state"
CURRENT_RELEASE_FILE="${RELEASE_STATE_DIR}/current.env"
PREVIOUS_RELEASE_FILE="${RELEASE_STATE_DIR}/previous.env"
IMAGE_REPO="ghcr.io/mdauri/agendoro-frontend"
PRIMARY_CONTAINER="agendoro-frontend"
BACKUP_STATE_DIR="${BACKUP_STATE_DIR:-/opt/agendoro-api/.backup-state}"
BACKUP_MAX_AGE_SECONDS="${BACKUP_MAX_AGE_SECONDS:-93600}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-https://agenda.dauri.com.br/}"
DEPLOY_IMAGE_REF="${DEPLOY_IMAGE_REF:-}"

REQUIRED_BACKUP_STATE_FILES=(
  "${BACKUP_STATE_DIR}/last_successful_remote_backup_postgres"
  "${BACKUP_STATE_DIR}/last_successful_remote_backup_configs"
  "${BACKUP_STATE_DIR}/last_successful_remote_backup_secure"
  "${BACKUP_STATE_DIR}/last_successful_remote_backup_volumes"
)

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

ensure_dir() {
  local path="$1"
  mkdir -p "$path"
  chmod 700 "$path"
}

read_state_value() {
  local key="$1"
  local file="$2"

  awk -F= -v key="$key" '$1 == key { print substr($0, index($0, "=") + 1); exit }' "$file"
}

state_file_is_recent() {
  local file="$1"
  local now
  local modified_at
  local age_seconds

  [[ -f "$file" ]] || return 1
  now="$(date +%s)"
  modified_at="$(stat -c %Y "$file")"
  age_seconds="$((now - modified_at))"
  [[ "$age_seconds" -le "$BACKUP_MAX_AGE_SECONDS" ]]
}

verify_backup_states() {
  local state_file

  for state_file in "${REQUIRED_BACKUP_STATE_FILES[@]}"; do
    if ! state_file_is_recent "$state_file"; then
      fail "backup state file is missing or stale: ${state_file}"
    fi

    if [[ "$(read_state_value status "$state_file")" != "ok" ]]; then
      fail "backup state file does not report status=ok: ${state_file}"
    fi
  done
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

resolve_repo_digest_from_container() {
  local container_name="$1"
  local image_id

  if ! docker ps -a --format '{{.Names}}' | grep -Fxq "$container_name"; then
    return 0
  fi

  image_id="$(docker inspect -f '{{.Image}}' "$container_name")"
  docker image inspect --format '{{range .RepoDigests}}{{println .}}{{end}}' "$image_id" 2>/dev/null \
    | grep "^${IMAGE_REPO}@" \
    | head -n1 \
    || true
}

resolve_current_release_ref() {
  local current_ref=""

  if [[ -f "$CURRENT_RELEASE_FILE" ]]; then
    current_ref="$(read_state_value image_ref "$CURRENT_RELEASE_FILE")"
  fi

  if [[ -z "$current_ref" && -f "$RELEASE_ENV_FILE" ]]; then
    current_ref="$(read_state_value AGENDORO_FRONTEND_IMAGE "$RELEASE_ENV_FILE")"
  fi

  if [[ -z "$current_ref" ]]; then
    current_ref="$(resolve_repo_digest_from_container "$PRIMARY_CONTAINER")"
  fi

  printf '%s' "$current_ref"
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
ensure_dir "$RELEASE_STATE_DIR"

require_env DEPLOY_IMAGE_REF

verify_backup_states

current_release_ref="$(resolve_current_release_ref)"
if [[ -n "$current_release_ref" && "$current_release_ref" != "$DEPLOY_IMAGE_REF" ]]; then
  write_release_state "$PREVIOUS_RELEASE_FILE" "$current_release_ref" "pre_deploy_snapshot"
fi

write_release_env "$NEXT_RELEASE_ENV_FILE" "$DEPLOY_IMAGE_REF"
docker compose --env-file "$NEXT_RELEASE_ENV_FILE" -f "$COMPOSE_FILE" config >/dev/null

login_ghcr_if_configured

log "pulling target image ${DEPLOY_IMAGE_REF}"
docker compose --env-file "$NEXT_RELEASE_ENV_FILE" -f "$COMPOSE_FILE" pull

log "stopping current frontend container if it exists"
docker compose --env-file "$NEXT_RELEASE_ENV_FILE" -f "$COMPOSE_FILE" down --remove-orphans || true
if docker ps -a --format '{{.Names}}' | grep -Fxq "$PRIMARY_CONTAINER"; then
  docker rm -f "$PRIMARY_CONTAINER"
fi

mv "$NEXT_RELEASE_ENV_FILE" "$RELEASE_ENV_FILE"

log "starting frontend with immutable image reference"
docker compose --env-file "$RELEASE_ENV_FILE" -f "$COMPOSE_FILE" up -d

wait_for_http_ok "$HEALTHCHECK_URL"
write_release_state "$CURRENT_RELEASE_FILE" "$DEPLOY_IMAGE_REF" "deploy"

log "cleaning unused images"
docker image prune -af

log "frontend deploy finished successfully with ${DEPLOY_IMAGE_REF}"

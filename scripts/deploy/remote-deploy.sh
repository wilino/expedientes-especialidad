#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-$(pwd)}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
PULL_REPO="${PULL_REPO:-false}"
BRANCH="${BRANCH:-main}"
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
RUN_SEED="${RUN_SEED:-false}"

cd "$APP_DIR"

if [[ "$PULL_REPO" == "true" ]]; then
  git fetch --all --prune
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
fi

if [[ -n "${GHCR_USERNAME:-}" && -n "${GHCR_TOKEN:-}" ]]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
fi

docker compose -f "$COMPOSE_FILE" pull
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

if [[ "$RUN_MIGRATIONS" == "true" ]]; then
  docker compose -f "$COMPOSE_FILE" exec -T api npm -w apps/api exec prisma migrate deploy
fi

if [[ "$RUN_SEED" == "true" ]]; then
  docker compose -f "$COMPOSE_FILE" exec -T api npm -w apps/api run prisma:seed
fi

docker compose -f "$COMPOSE_FILE" ps

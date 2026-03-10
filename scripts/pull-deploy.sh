#!/bin/bash
# 수동 pull 후 빌드 및 재시작
# 사용법: ./scripts/pull-deploy.sh
set -e

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$APP_DIR"

if [ -f .env.dev ]; then
  set -a
  source .env.dev
  set +a
elif [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo ">>> git pull origin main"
git pull origin main

COMPOSE_ENV=""
[ -f .env.dev ] && COMPOSE_ENV="--env-file .env.dev" || [ -f .env ] && COMPOSE_ENV="--env-file .env"

echo ">>> docker build & up..."
if docker compose version &>/dev/null; then
  docker compose $COMPOSE_ENV build
  docker compose $COMPOSE_ENV up -d --force-recreate
else
  docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$APP_DIR:$APP_DIR" -w="$APP_DIR" \
    -e DB_USERNAME="$DB_USERNAME" -e DB_PASSWORD="$DB_PASSWORD" \
    docker/compose:1.29.2 build
  docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$APP_DIR:$APP_DIR" -w="$APP_DIR" \
    -e DB_USERNAME="$DB_USERNAME" -e DB_PASSWORD="$DB_PASSWORD" \
    docker/compose:1.29.2 up -d --force-recreate
fi

echo ">>> 완료"

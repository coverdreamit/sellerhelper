#!/bin/bash
# 수동 pull 후 빌드 및 재시작
# 사용법: ./scripts/pull-deploy.sh [test|dev]  (기본: test)
set -e

ENV_TYPE="${1:-test}"
APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$APP_DIR"

# 환경별 env 파일 로드
ENV_FILE=".env.$ENV_TYPE"
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
elif [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo ">>> 환경: $ENV_TYPE"
echo ">>> git pull origin main"
git pull origin main

# 환경별 compose 파일 및 env
if [ "$ENV_TYPE" = "dev" ]; then
  COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"
  [ -f .env.dev ] && COMPOSE_ENV="--env-file .env.dev" || COMPOSE_ENV=""
else
  COMPOSE_FILES="-f docker-compose.yml -f docker-compose.test.yml"
  [ -f .env.test ] && COMPOSE_ENV="--env-file .env.test" || COMPOSE_ENV=""
fi

echo ">>> docker build & up..."
if docker compose version &>/dev/null; then
  docker compose $COMPOSE_FILES $COMPOSE_ENV build
  docker compose $COMPOSE_FILES $COMPOSE_ENV up -d --force-recreate
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

#!/bin/bash
# 서버에서 5분마다 실행하는 배포 스크립트
# 변경사항 있을 때만: git pull → docker 빌드 → docker compose up
# 사용법: ./scripts/deploy.sh [--force]
set -e

FORCE_DEPLOY=""
[ "${1:-}" = "--force" ] && FORCE_DEPLOY=1
APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$APP_DIR"
echo "$(date -Iseconds) deploy.sh: checking..."

# .env.dev 또는 .env 로드
if [ -f .env.dev ]; then
  set -a
  source .env.dev
  set +a
elif [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# origin/main 최신 정보 가져오기
git fetch origin main || true

# 로컬과 origin/main 비교 (변경 없으면 종료)
if [ -z "$FORCE_DEPLOY" ] && [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ]; then
  echo "$(date -Iseconds) deploy.sh: no change, skip"
  exit 0
fi

[ -z "$FORCE_DEPLOY" ] && git pull origin main

COMPOSE_ENV=""
[ -f .env.dev ] && COMPOSE_ENV="--env-file .env.dev" || [ -f .env ] && COMPOSE_ENV="--env-file .env"

# docker compose 미설치 시 docker/compose 이미지 사용
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

#!/bin/bash
# 수동 pull 후 빌드 및 재시작
# 사용법: ./scripts/pull-deploy.sh
set -e

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$APP_DIR"

# .env 파일이 있으면 로드
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo ">>> git pull origin main"
git pull origin main

echo ">>> docker build & up..."
if docker compose version &>/dev/null; then
  docker compose build
  docker compose up -d --force-recreate
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

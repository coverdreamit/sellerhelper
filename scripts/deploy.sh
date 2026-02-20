#!/bin/bash
# 서버에서 5분마다 실행하는 배포 스크립트
# 변경사항 있을 때만: git pull → docker 빌드 → docker compose up
set -e

APP_DIR="${APP_DIR:-$HOME/sellerhelper}"
cd "$APP_DIR"

# .env 파일이 있으면 로드 (DB_USERNAME, DB_PASSWORD 등)
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# origin/main 최신 정보 가져오기
git fetch origin main 2>/dev/null || true

# 로컬과 origin/main 비교 (변경 없으면 종료)
if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ]; then
  exit 0
fi

git pull origin main

# docker compose 미설치 시 docker/compose 이미지 사용
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

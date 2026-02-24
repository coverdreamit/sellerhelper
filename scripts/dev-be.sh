#!/bin/bash
# 백엔드 개발모드 실행 (포어그라운드, local 프로파일)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BE="$ROOT/sellerhelper-be"
cd "$BE"

./mvnw spring-boot:run -Dspring-boot.run.profiles=local "$@"

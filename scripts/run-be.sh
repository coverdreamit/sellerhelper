#!/bin/bash
# 백엔드 런타임 실행 (jar 빌드 후 실행, 프로덕션용)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BE="$ROOT/sellerhelper-be"
cd "$BE"

./mvnw package -q -DskipTests
JAR=$(ls target/sellerhelper-be-*.jar 2>/dev/null | head -1)
if [ -z "$JAR" ]; then
  echo "jar 파일을 찾을 수 없습니다."
  exit 1
fi

exec java -jar "$JAR" "$@"

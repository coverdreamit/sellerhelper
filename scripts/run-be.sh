#!/bin/bash
# Commerce API 런타임 실행 (jar 빌드 후 실행, 프로덕션용)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/sellerhelper-msa"
mvn package -pl sellerhelper-commerce -am -q -DskipTests
JAR=$(ls sellerhelper-commerce/target/sellerhelper-commerce-*.jar 2>/dev/null | head -1)
if [ -z "$JAR" ]; then
  echo "jar 파일을 찾을 수 없습니다."
  exit 1
fi

exec java -jar "$JAR" "$@"

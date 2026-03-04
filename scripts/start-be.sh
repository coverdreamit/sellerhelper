#!/bin/bash
# Commerce API 시작 (백그라운드)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MSA="$ROOT/sellerhelper-msa"
PID_FILE="$MSA/sellerhelper-commerce/target/sellerhelper-commerce.pid"

cd "$MSA"

# 기존 프로세스 확인
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "이미 실행 중 (PID: $OLD_PID)"
    exit 1
  fi
  rm -f "$PID_FILE"
fi

mkdir -p "$MSA/sellerhelper-commerce/target"
LOG_FILE="$MSA/sellerhelper-commerce/target/sellerhelper-commerce.log"
nohup mvn spring-boot:run -pl sellerhelper-commerce -Dspring-boot.run.profiles="${SPRING_PROFILES_ACTIVE:-local}" >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "Commerce API 시작됨 (PID: $(cat "$PID_FILE"), 로그: $LOG_FILE)"

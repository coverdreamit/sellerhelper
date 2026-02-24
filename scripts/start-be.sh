#!/bin/bash
# 백엔드 애플리케이션 시작 (백그라운드)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BE="$ROOT/sellerhelper-be"
PID_FILE="$BE/target/sellerhelper-be.pid"

cd "$BE"

# 기존 프로세스 확인
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "이미 실행 중 (PID: $OLD_PID)"
    exit 1
  fi
  rm -f "$PID_FILE"
fi

mkdir -p "$BE/target"
LOG_FILE="$BE/target/sellerhelper-be.log"
nohup ./mvnw spring-boot:run -Dspring-boot.run.profiles="${SPRING_PROFILES_ACTIVE:-local}" >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "백엔드 시작됨 (PID: $(cat "$PID_FILE"), 로그: $LOG_FILE)"

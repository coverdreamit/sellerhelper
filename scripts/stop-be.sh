#!/bin/bash
# 백엔드 애플리케이션 종료
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BE="$ROOT/sellerhelper-be"
PID_FILE="$BE/target/sellerhelper-be.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "실행 중인 백엔드가 없습니다."
  exit 0
fi

PID=$(cat "$PID_FILE")
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID" 2>/dev/null || true
  # Graceful shutdown 대기
  for i in {1..10}; do
    if ! kill -0 "$PID" 2>/dev/null; then
      break
    fi
    sleep 2
  done
  # 여전히 살아있으면 강제 종료
  if kill -0 "$PID" 2>/dev/null; then
    kill -9 "$PID" 2>/dev/null || true
  fi
  echo "백엔드 종료됨 (PID: $PID)"
else
  echo "프로세스가 이미 종료됨 (PID: $PID)"
fi

rm -f "$PID_FILE"

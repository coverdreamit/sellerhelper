#!/bin/bash
# 백엔드 애플리케이션 재시작
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
"$SCRIPT_DIR/stop-be.sh"
sleep 2
"$SCRIPT_DIR/start-be.sh"

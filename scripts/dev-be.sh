#!/bin/bash
# Commerce API 개발모드 실행 (포어그라운드, local 프로파일)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/sellerhelper-msa"
mvn spring-boot:run -pl sellerhelper-commerce -Dspring-boot.run.profiles=local "$@"

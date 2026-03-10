#!/usr/bin/env bash
# 서버( FE / BE ) 동작 확인용 curl 스크립트
# 사용: ./scripts/curl-health-check.sh [HOST]
# HOST 미지정 시 localhost (같은 서버에서 실행할 때)

HOST="${1:-localhost}"
FE_URL="http://${HOST}:5000"
BE_URL="http://${HOST}:5001"

echo "=== SellerHelper 서버 헬스체크 (HOST=${HOST}) ==="
echo ""

echo "1) 백엔드 (BE :5001)"
echo "   curl -s -o /dev/null -w '%{http_code}' ${BE_URL}/api/health"
BE_CODE=$(curl -s -o /dev/null -w '%{http_code}' "${BE_URL}/api/health")
if [ "$BE_CODE" = "200" ]; then
  echo "   -> HTTP $BE_CODE OK"
  curl -s "${BE_URL}/api/health" | head -c 200
  echo ""
else
  echo "   -> HTTP $BE_CODE (실패)"
fi
echo ""

echo "2) 프론트엔드 (FE :5000) - 루트"
FE_ROOT_CODE=$(curl -s -o /dev/null -w '%{http_code}' "${FE_URL}/")
echo "   curl -s -o /dev/null -w '%{http_code}' ${FE_URL}/"
echo "   -> HTTP $FE_ROOT_CODE"
echo ""

echo "=== 요약 ==="
if [ "$BE_CODE" = "200" ] && [ "$FE_ROOT_CODE" = "200" ]; then
  echo "모두 정상 (BE :5001, FE :5000)"
else
  echo "BE: $BE_CODE, FE: $FE_ROOT_CODE"
fi

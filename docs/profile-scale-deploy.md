# 프로필별 서버 가동 (포털 1 + 커머스 n)

## 개요

- **portal** 프로필: 인증(JWT 발급), 사용자/회사/권한 관리 → 1개 인스턴스
- **commerce** 프로필: 스토어/몰/상품/주문 API → n개 인스턴스 (로드밸런싱)
- **nginx**: 라우팅 (인증 → portal, 커머스 → commerce upstream)

## 로컬에서 프로필별 실행

```bash
cd sellerhelper-be

# 포털만 (인증·사용자 등)
SPRING_PROFILES_ACTIVE=portal,local mvn spring-boot:run

# 커머스만 (다른 터미널)
SERVER_PORT=5080 SPRING_PROFILES_ACTIVE=commerce,local mvn spring-boot:run
# 추가 인스턴스
SERVER_PORT=5082 SPRING_PROFILES_ACTIVE=commerce,local mvn spring-boot:run
SERVER_PORT=5083 SPRING_PROFILES_ACTIVE=commerce,local mvn spring-boot:run
```

## Docker (포털 1 + 커머스 n + nginx)

```bash
# .env에 DB_HOST, DB_USERNAME, DB_PASSWORD 등 설정
docker compose -f docker-compose.scale.yml up -d
```

- 포털: 1개 (sellerhelper-portal)
- 커머스: 3개 (sellerhelper-commerce-1, 2, 3)
- nginx: 80 포트, /api/* 라우팅

### 커머스 인스턴스 개수 조정

1. **늘리기**: `docker-compose.scale.yml`에 `sellerhelper-commerce-4` 서비스 복사 추가
2. **줄이기**: 불필요한 commerce 서비스 제거
3. **nginx**: `nginx/sellerhelper.conf` upstream에 해당 서버 추가/제거

## 라우팅 규칙

| 경로 | 대상 |
|------|------|
| /api/auth/* | portal |
| /api/users | portal |
| /api/companies | portal |
| /api/roles | portal |
| /api/my-company | portal |
| /api/app/* | portal |
| /api/stores, /api/malls, /api/my-stores, 기타 | commerce (로드밸런싱) |

## 프론트엔드 연동

FE는 nginx를 통해 API 호출. 예: `http://localhost/api` (또는 운영 도메인).

- `NEXT_PUBLIC_API_URL`: nginx 주소 (예: `http://localhost`)
- `NEXT_PUBLIC_PORTAL_URL`: 동일 (nginx가 내부 라우팅)

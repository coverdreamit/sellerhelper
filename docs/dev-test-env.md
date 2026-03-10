# Dev 환경 설정

현재는 **dev 환경 하나**만 사용합니다. 테스트(test)·운영(prod) 서버는 차후 추가할 예정입니다.

---

## 포트

| 서비스 | 포트 |
|--------|------|
| 프론트엔드 (FE) | 5000 |
| 백엔드 API (BE) | 5001 |

---

## DB

- DB 이름: `sellerhelper`
- PostgreSQL에서 DB 생성:

```sql
CREATE DATABASE "sellerhelper";
```

---

## 환경 변수

`.env.dev.example`을 복사해 `.env.dev` (또는 `.env`)를 만들고 DB 계정을 입력합니다.

```bash
cp .env.dev.example .env.dev
# .env.dev 편집: DB_USERNAME, DB_PASSWORD 등
```

---

## 실행

```bash
# 단일 compose 파일로 실행
docker compose --env-file .env.dev up -d

# 수동 배포
./scripts/pull-deploy.sh
```

API는 Next.js 프록시 없이 `NEXT_PUBLIC_API_URL`(기본 `http://localhost:5001`)로 직접 호출합니다.

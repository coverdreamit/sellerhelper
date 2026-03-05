# Dev / Test 환경 분리

개발용(dev)과 테스트용(test) 환경을 DB와 포트로 분리하여 운영합니다.

---

## DB 구분

| 환경 | DB 이름 | 용도 |
|------|---------|------|
| **test** | `sellerhelper-test` | 기존 운영·테스트용 (안정된 데이터) |
| **dev** | `sellerhelper-dev` | 개발·실험용 (새 기능 검증) |

---

## 사전 준비: DB 생성

PostgreSQL에서 `sellerhelper-dev` 데이터베이스를 생성합니다:

```sql
-- PostgreSQL 접속 후 실행
CREATE DATABASE "sellerhelper-dev";
```

> 기존 DB가 `sellerhelper`인 경우, test 환경으로 사용하려면 `sellerhelper-test`로 이름을 변경하거나 새로 생성 후 마이그레이션하세요.

---

## 환경 설정 파일

1. 예시 파일을 복사합니다:

```bash
cp .env.test.example .env.test
cp .env.dev.example .env.dev
```

2. 각 파일에 실제 DB 계정을 입력합니다:

```bash
# .env.test
DB_NAME=sellerhelper-test
DB_USERNAME=실제사용자명
DB_PASSWORD=실제비밀번호

# .env.dev
DB_NAME=sellerhelper-dev
DB_USERNAME=실제사용자명
DB_PASSWORD=실제비밀번호
```

---

## 실행 방법

### Test 환경 (기본, 포트 5080/5081/5000)

```bash
./scripts/pull-deploy.sh test
# 또는
./scripts/pull-deploy.sh
```

### Dev 환경 (포트 5082/5083/5001)

```bash
./scripts/pull-deploy.sh dev
```

### 동시 실행

dev와 test는 서로 다른 포트를 사용하므로 **동시에 실행**할 수 있습니다.

| 환경 | Portal | Commerce | 프론트엔드 |
|------|---------|-----------|------------|
| test | 5081 | 5080 | 5000 |
| dev  | 5082 | 5083 | 5001 |

---

## 크론 배포 (5분마다)

Test 환경을 자동 배포하는 경우 (기본):

```
*/5 * * * * bash $HOME/sellerhelper/scripts/deploy.sh test >> $HOME/sellerhelper/deploy.log 2>&1
```

Dev 환경을 자동 배포하는 경우:

```
*/5 * * * * bash $HOME/sellerhelper/scripts/deploy.sh dev >> $HOME/sellerhelper/deploy.log 2>&1
```

---

## Docker Compose 직접 사용

```bash
# Test
docker compose -f docker-compose.yml -f docker-compose.test.yml --env-file .env.test up -d

# Dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.dev up -d
```

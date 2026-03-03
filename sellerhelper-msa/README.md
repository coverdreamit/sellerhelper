# sellerhelper-msa (Portal + Core)

인증·사용자·권한·회사 관리는 **Portal**, 스토어·몰·주문 등 비즈니스 API는 **sellerhelper-be**에서 JWT로 검증합니다.

## 구조

| 모듈 | 설명 | 포트 |
|------|------|------|
| **sellerhelper-core** | JWT 발급/검증, AuthUser (공통 라이브러리) | - |
| **sellerhelper-portal** | 로그인/회원가입, 사용자·권한·회사 CRUD, JWT 발급 | 8081 |
| **sellerhelper-be** | 스토어·몰·상품·주문 API (JWT 검증) | 5080 |

## 로컬 실행

### 1. Core 설치 (BE 빌드에 필요)

```bash
cd sellerhelper-msa
mvn install -pl sellerhelper-core -am -DskipTests
```

### 2. Portal 실행 (인증 서버)

```bash
cd sellerhelper-msa
mvn spring-boot:run -pl sellerhelper-portal
# 기본 포트: 8081
```

### 3. API 실행 (sellerhelper-be)

```bash
cd sellerhelper-be
mvn spring-boot:run
# 기본 포트: 5080
```

**중요:** Portal과 BE의 `jwt.secret`(또는 `JWT_SECRET`) 값이 동일해야 합니다.

## API 사용 흐름

1. **로그인/회원가입** → Portal  
   - `POST /api/auth/login` → `{ "token": "eyJ...", "uid", "loginId", "name", "roleCodes", "menuKeys", "companyUid" }`  
   - `POST /api/auth/register`  
   - `GET /api/auth/me` (토큰 필요)  
   - `POST /api/auth/logout` (클라이언트에서 토큰 폐기)

2. **그 외 API** → sellerhelper-be  
   - 요청 헤더: `Authorization: Bearer <token>`  
   - 예: 사용자 목록, 스토어, 몰, 주문 등

## Docker

프로젝트 루트에서:

```bash
docker-compose up -d
```

- Portal: 8081  
- BE: 5080  
- FE: 5000  

환경 변수 `JWT_SECRET`을 동일하게 설정하세요.

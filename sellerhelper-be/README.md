# 셀러 보조 사이트 (백엔드)

여러 온라인 쇼핑몰 API를 연동하는 셀러 보조 사이트의 백엔드입니다.

## 기술 스택

- Java 16
- Spring Boot 2.7
- Maven + Maven Wrapper (mvnw)
- Spring Data JPA, PostgreSQL
- Hibernate DDL: `update` (엔티티 기준 자동 스키마 반영)

## 프로젝트 구조

```
src/main/java/com/sellerhelper/
├── SellerhelperBeApplication.java
├── config/          # JPA Auditing, PasswordEncoder, CORS 등
├── controller/     # REST API
├── dto/            # 요청/응답 DTO
├── entity/         # JPA 엔티티
├── exception/      # 예외 및 전역 핸들러
├── repository/     # Spring Data JPA Repository
└── service/        # 비즈니스 로직
```

### 유저 관리 API

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/users | 사용자 목록 (keyword, roleCode 검색, 페이지네이션) |
| GET | /api/users/{uid} | 사용자 단건 조회 |
| POST | /api/users | 사용자 생성 |
| PUT | /api/users/{uid} | 사용자 수정 |
| DELETE | /api/users/{uid} | 사용자 삭제 |
| GET | /api/roles | 권한 목록 (드롭다운용) |

## DB 테이블 (엔티티 기준 자동 생성)

- **공통 필드**: uid, sort_order, sort, created_at, created_by, updated_at, updated_by
- **시스템**: users, roles, user_roles, menus, code_groups, codes
- **스토어 연동**: malls, stores, store_auths
- **기타**: companies, products, product_malls, orders, order_items, shippings

## 실행 방법

### 스크립트 사용 (권장)

프로젝트 루트의 `scripts/` 폴더에서 실행:

| 스크립트 | 설명 |
|---------|------|
| `start-be.bat` / `start-be.sh` | 백엔드 시작 |
| `stop-be.bat` / `stop-be.sh` | 백엔드 종료 |
| `restart-be.bat` / `restart-be.sh` | 재시작 |
| `dev-be.bat` / `dev-be.sh` | 개발모드 (local 프로파일) |
| `run-be.bat` / `run-be.sh` | 런타임 (jar 빌드 후 실행) |

```bash
# Windows
cd scripts
dev-be.bat        # 개발모드
start-be.bat      # 시작 (같은 터미널에서 실행)
stop-be.bat       # 종료

# Linux/macOS
./scripts/dev-be.sh
./scripts/start-be.sh
./scripts/stop-be.sh
```

### Maven Wrapper 직접 실행

```bash
cd sellerhelper-be
./mvnw spring-boot:run -Dspring-boot.run.profiles=local    # Windows: mvnw.cmd
```

### 수동 설정

1. **로컬 DB 설정**  
   `src/main/resources/application-local.yml`에 DB 접속 정보가 기본값으로 들어 있습니다.  
   비밀번호 등은 환경 변수로 덮어쓸 수 있습니다.

2. **프로파일**  
   환경 변수: `SPRING_PROFILES_ACTIVE=local`

3. **서버 포트**  
   기본 5080. 변경 시 `SERVER_PORT` 환경 변수 또는 `application.yml`에서 설정.

4. **헬스 체크**  
   http://localhost:5080/api/health

## DB 접속 정보 (참고)

- Host: coverdreamit.iptime.org, Port: 9432, DB: sellerhelper
- 계정: hipms / hipms (또는 postgres / Skcc!@3456 — 환경에 맞게 사용)
- **보안**: 운영 환경에서는 반드시 환경 변수(`DB_PASSWORD` 등)로 설정하고, `application-local.yml`은 git에 커밋하지 않는 것을 권장합니다.

## 초기 권한 데이터

애플리케이션 최초 실행 후 `src/main/resources/db/init-roles.sql`을 수동 실행하여 기본 권한(관리자, 셀러, 주문담당)을 등록합니다.

## 추후 작업

- 인증/인가 적용 후 유저 API 보안 강화
- 쇼핑몰별 API 연동 모듈 (쿠팡, 네이버 등)
- 정산·고객·발주업체 등 추가 엔티티/API

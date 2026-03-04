# 셀러 보조 사이트 (백엔드)

여러 온라인 쇼핑몰 API를 연동하는 셀러 보조 사이트의 백엔드입니다.

## 기술 스택

- Java 16
- Spring Boot 2.7
- Maven + Maven Wrapper (mvnw)
- Spring Data JPA, PostgreSQL
- Spring Security (세션 기반 인증)
- Hibernate DDL: `update` (엔티티 기준 자동 스키마 반영)

## 프로젝트 구조

```
src/main/java/com/sellerhelper/
├── SellerhelperBeApplication.java
├── config/          # JPA Auditing, Security, CORS, Initializers
├── controller/      # REST API
├── dto/             # 요청/응답 DTO
├── entity/          # JPA 엔티티
├── exception/       # 예외 및 전역 핸들러
├── repository/      # Spring Data JPA Repository
└── service/         # 비즈니스 로직
```

## REST API

### 인증

| Method | Path | 설명 |
|--------|------|------|
| POST | /api/auth/login | 로그인 |
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/logout | 로그아웃 |

### 사용자 & 권한

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/users | 사용자 목록 (keyword, roleCode, enabled 검색, 페이지네이션) |
| GET | /api/users/{uid} | 사용자 단건 조회 |
| POST | /api/users | 사용자 생성 |
| PUT | /api/users/{uid} | 사용자 수정 |
| DELETE | /api/users/{uid} | 사용자 삭제 |
| GET | /api/roles | 권한 목록 |
| GET | /api/roles/{uid} | 권한 단건 조회 |
| POST | /api/roles | 권한 생성 |
| PUT | /api/roles/{uid} | 권한 수정 |
| DELETE | /api/roles/{uid} | 권한 삭제 |

### 플랫폼 (Mall)

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/malls | 플랫폼 목록 (?enabledOnly=true) |
| GET | /api/malls/{uid} | 플랫폼 단건 조회 |
| POST | /api/malls | 플랫폼 생성 |
| PUT | /api/malls/{uid} | 플랫폼 수정 |
| DELETE | /api/malls/{uid} | 플랫폼 삭제 |

### 스토어 (Store)

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/stores | 스토어 목록 (?mallUid, ?companyUid) |
| GET | /api/stores/{uid} | 스토어 단건 조회 |
| POST | /api/stores | 스토어 생성 |
| PUT | /api/stores/{uid} | 스토어 수정 |
| DELETE | /api/stores/{uid} | 스토어 삭제 |

### 회사 (Company)

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/companies | 회사 목록 |

### 기타

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/health | 헬스 체크 |
| GET | /api/app/config | 앱 설정 (dev-mode 등) |

## DB 테이블 (엔티티 기준 자동 생성)

| 테이블 | 설명 |
|--------|------|
| users | 사용자 |
| roles | 권한 (menu_keys 포함) |
| user_roles | 사용자-권한 매핑 |
| menus | 메뉴 (참조) |
| malls | 플랫폼 (쿠팡, 네이버 등) |
| companies | 회사 (셀러) |
| stores | 스토어 (mall + company FK) |
| store_auths | 스토어 API 인증 정보 |
| code_groups, codes | 공통 코드 |
| products, product_malls, orders, order_items, shippings | 상품·주문·배송 |

- **공통 필드**: uid, sort_order, sort, created_at, created_by, updated_at, updated_by

## 초기화 (ApplicationRunner)

| 클래스 | 역할 |
|--------|------|
| AdminInitializer | admin/admin 관리자 계정 생성 |
| MallInitializer | 플랫폼 초기 데이터 (쿠팡, 네이버, 11번가, 지마켓, 옥션) |
| CompanyInitializer | 회사 초기 데이터 (테스트회사) |
| RoleMenuKeysInitializer | 기존 Role에 menu_keys 기본값 설정 |

## DB 초기 스크립트 (선택)

`src/main/resources/db/` 폴더에 수동 적용용 SQL 스크립트가 있습니다.

| 파일 | 설명 |
|------|------|
| init-malls.sql | 플랫폼 초기 데이터 |
| init-companies.sql | 회사 초기 데이터 |
| init-roles.sql | 권한 초기 데이터 |
| migrate-role-menu-keys.sql | Role menu_keys 컬럼 값 설정 |

상세: [db/README.md](src/main/resources/db/README.md)

## 실행 방법

### 스크립트 사용 (권장)

프로젝트 루트의 `scripts/` 폴더에서 실행:

```bash
cd scripts
dev-be.bat        # Windows 개발모드 (포트 5080)
# ./dev-be.sh     # Linux/macOS
```

### Maven Wrapper 직접 실행

```bash
cd sellerhelper-be
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# Windows: mvnw.cmd
```

### 설정

- **프로파일**: `SPRING_PROFILES_ACTIVE=local` (기본)
- **포트**: 5080 (`SERVER_PORT` 환경 변수)
- **DB**: `application-local.yml` 참고 (환경 변수로 덮어쓰기)
- **헬스 체크**: http://localhost:5080/api/health

## 관련 문서

- [스토어 관리·사용 가이드](../docs/STORE_MANAGEMENT.md) - 플랫폼/스토어 개념, API 연동 흐름

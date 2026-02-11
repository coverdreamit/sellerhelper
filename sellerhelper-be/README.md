# 셀러 보조 사이트 (백엔드)

여러 온라인 쇼핑몰 API를 연동하는 셀러 보조 사이트의 백엔드입니다.

## 기술 스택

- Java 11
- Spring Boot 2.7
- Maven
- Spring Data JPA, PostgreSQL
- Hibernate DDL: `update` (엔티티 기준 자동 스키마 반영)

## 프로젝트 구조

```
src/main/java/com/sellerhelper/
├── SellerhelperBeApplication.java
├── config/          # JPA Auditing 등
├── entity/          # JPA 엔티티 (BaseEntity, User, Mall, Store, Order, Product, Shipping 등)
├── repository/      # Spring Data JPA Repository
└── controller/      # REST API
```

## DB 테이블 (엔티티 기준 자동 생성)

- **공통 필드**: uid, sort_order, sort, created_at, created_by, updated_at, updated_by
- **시스템**: users, roles, user_roles, menus, code_groups, codes
- **스토어 연동**: malls, stores, store_auths
- **기타**: companies, products, product_malls, orders, order_items, shippings

## 실행 방법

1. **로컬 DB 설정**  
   `src/main/resources/application-local.yml`에 DB 접속 정보가 기본값으로 들어 있습니다.  
   비밀번호 등은 환경 변수로 덮어쓸 수 있습니다.

2. **프로파일 지정 후 실행**
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```
   또는 환경 변수: `SPRING_PROFILES_ACTIVE=local`

3. **서버 포트**  
   기본 8080. 변경 시 `SERVER_PORT` 환경 변수 또는 `application.yml`에서 설정.

4. **헬스 체크**  
   http://localhost:8080/api/health

## DB 접속 정보 (참고)

- Host: coverdreamit.iptime.org, Port: 9432, DB: sellerhelper
- 계정: hipms / hipms (또는 postgres / Skcc!@3456 — 환경에 맞게 사용)
- **보안**: 운영 환경에서는 반드시 환경 변수(`DB_PASSWORD` 등)로 설정하고, `application-local.yml`은 git에 커밋하지 않는 것을 권장합니다.

## 추후 작업

- REST API 상세 설계 및 Controller/Service 계층 구현
- 쇼핑몰별 API 연동 모듈 (쿠팡, 네이버 등)
- 인증/인가 (Spring Security, JWT 등)
- 정산·고객·발주업체 등 추가 엔티티/API

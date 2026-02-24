# DB 초기화 스크립트

JPA `ddl-auto: update`로 스키마가 자동 생성된 후, 초기 데이터를 넣을 때 사용합니다.

## 실행 순서

1. 애플리케이션 최초 실행 → JPA가 테이블 생성
2. 아래 스크립트를 DB에 순서대로 실행

```bash
# PostgreSQL 예시
psql -h <host> -U <user> -d sellerhelper -f init-malls.sql
psql -h <host> -U <user> -d sellerhelper -f init-companies.sql
psql -h <host> -U <user> -d sellerhelper -f init-roles.sql
psql -h <host> -U <user> -d sellerhelper -f migrate-role-menu-keys.sql  # 필요 시
```

## 스크립트 설명

| 파일 | 설명 |
|------|------|
| init-malls.sql | 플랫폼(쿠팡, 네이버, 11번가 등) 초기 데이터 |
| init-companies.sql | 회사 초기 데이터 (스토어 소속 선택용) |
| init-roles.sql | 권한(ADMIN, USER 등) 초기 데이터 |
| migrate-role-menu-keys.sql | 기존 roles에 menu_keys 컬럼 값 설정 |

## 참고

- `MallInitializer`가 애플리케이션 시작 시 자동으로 malls에 기본 데이터를 넣습니다.
- 수동으로 SQL만 적용하고 싶다면 MallInitializer를 비활성화하거나, init-malls.sql을 사용하세요.

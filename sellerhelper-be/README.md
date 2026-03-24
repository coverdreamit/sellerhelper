# sellerhelper-be (단일 프로젝트)

셀러 보조 API - 인증·사용자·회사·스토어·몰·상품·주문을 한 프로젝트로 제공합니다.

## 구조

```
sellerhelper-msa/
├── pom.xml              # 단일 jar, Spring Boot
├── Dockerfile
├── src/main/java/com/sellerhelper/
│   ├── SellerhelperApplication.java
│   ├── core/security/   # JWT 인증 (기존 core 모듈 통합)
│   ├── config/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   └── dto/
└── src/main/resources/
    ├── application.yml
    ├── application-local.yml      # PostgreSQL 로컬
    ├── application-local-h2.yml   # H2 인메모리 (DB 없이 실행)
    └── application-prod.yml       # 운영
```

## 실행

```bash
# 로컬 (PostgreSQL)
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run

# H2 인메모리 (DB 없이)
SPRING_PROFILES_ACTIVE=local,local-h2 mvn spring-boot:run

# 운영
SPRING_PROFILES_ACTIVE=prod java -jar target/sellerhelper-be-0.1.0-SNAPSHOT.jar
```

## 프로필

| 프로필     | 용도                         |
| ---------- | ---------------------------- |
| `local`    | 로컬 개발 (PostgreSQL)       |
| `local-h2` | H2 인메모리 (DB 설치 불필요) |
| `prod`     | 운영 배포                    |

## 포트

기본 포트: **5001** (환경변수 `SERVER_PORT`로 변경 가능)

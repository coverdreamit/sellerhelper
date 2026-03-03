# 빌드 컨텍스트: 프로젝트 루트 (docker build -f sellerhelper-be/Dockerfile .)
# core 모듈을 먼저 설치한 뒤 BE 빌드
FROM eclipse-temurin:16-jdk-alpine AS builder
RUN apk add --no-cache maven

WORKDIR /workspace

# Core 빌드 및 로컬 설치
COPY sellerhelper-msa/pom.xml sellerhelper-msa/
COPY sellerhelper-msa/sellerhelper-core sellerhelper-msa/sellerhelper-core
RUN mvn -f sellerhelper-msa/pom.xml install -pl sellerhelper-core -am -DskipTests -B

# BE 빌드 (core 의존성 사용)
COPY sellerhelper-be/pom.xml sellerhelper-be/
COPY sellerhelper-be/src sellerhelper-be/src
RUN mvn -f sellerhelper-be/pom.xml package -DskipTests -B

# ========== Production Stage ==========
FROM eclipse-temurin:16-jdk-alpine
WORKDIR /app
COPY --from=builder /workspace/sellerhelper-be/target/*.jar app.jar
EXPOSE 5080
ENTRYPOINT ["java", "-jar", "app.jar"]

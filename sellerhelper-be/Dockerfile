# ========== Build Stage ==========
FROM maven:3.9-eclipse-temurin-16-alpine AS builder

WORKDIR /app

# 의존성 다운로드 (캐시 활용)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 소스 복사 및 빌드
COPY src ./src
RUN mvn package -DskipTests -B

# ========== Production Stage ==========
FROM eclipse-temurin:16-jre-alpine

WORKDIR /app

# JAR 복사
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

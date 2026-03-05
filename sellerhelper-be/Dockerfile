# 단일 프로젝트 빌드
FROM eclipse-temurin:16-jdk-alpine AS builder
RUN apk add --no-cache maven

WORKDIR /app
COPY pom.xml .
COPY src ./src

RUN mvn package -DskipTests -B

FROM eclipse-temurin:16-jdk-alpine
WORKDIR /app
COPY --from=builder /app/target/sellerhelper-be-*.jar app.jar
EXPOSE 5080
ENTRYPOINT ["java", "-jar", "app.jar"]

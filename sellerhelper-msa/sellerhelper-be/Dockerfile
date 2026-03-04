# 빌드 컨텍스트: sellerhelper-msa (모든 모듈 포함)
FROM eclipse-temurin:16-jdk-alpine AS builder
RUN apk add --no-cache maven

WORKDIR /msa
COPY . .

RUN mvn install -pl sellerhelper-core -am -DskipTests -B
RUN mvn package -pl sellerhelper-be -am -DskipTests -B

FROM eclipse-temurin:16-jdk-alpine
WORKDIR /app
COPY --from=builder /msa/sellerhelper-be/target/sellerhelper-be-*.jar app.jar
EXPOSE 5080
ENTRYPOINT ["java", "-jar", "app.jar"]

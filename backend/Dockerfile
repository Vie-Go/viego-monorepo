# Multi-stage build for the VieGo backend (Spring Boot 4, Java 25).
# Layered build → smaller, cache-friendly runtime image.
FROM eclipse-temurin:25-jdk AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw -q dependency:go-offline
COPY src ./src
RUN ./mvnw -q -DskipTests clean package

FROM eclipse-temurin:25-jre AS runtime
WORKDIR /app
# Non-root runtime user
RUN useradd -r -u 1001 viego
COPY --from=build /workspace/target/*.jar app.jar
USER viego
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

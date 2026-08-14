# Multi-stage build for Spring Boot application

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy Maven configuration
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Give Maven wrapper execute permission
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build Spring Boot application
RUN ./mvnw clean package -DskipTests


# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy generated JAR
COPY --from=build /app/target/*.jar app.jar

# Default port for local development
EXPOSE 8081

# Run Spring Boot application
# Render provides the PORT environment variable
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8081}"]

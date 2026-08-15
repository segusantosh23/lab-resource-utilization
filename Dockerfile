# Multi-stage Dockerfile for Spring Boot Production Deployment on Render

# Stage 1: Build JAR using Maven image
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and source code
COPY lab-resource-utilization/pom.xml ./lab-resource-utilization/
COPY lab-resource-utilization/src ./lab-resource-utilization/src

# Build production JAR
WORKDIR /app/lab-resource-utilization
RUN mvn clean package -DskipTests

# Stage 2: Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/lab-resource-utilization/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

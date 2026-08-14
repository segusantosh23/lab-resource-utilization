# Multi-stage Dockerfile for Spring Boot Application

# Stage 1: Build JAR using Maven
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY lab-resource-utilization/.mvn/ .mvn/
COPY lab-resource-utilization/mvnw lab-resource-utilization/pom.xml ./
RUN chmod +x mvnw
COPY lab-resource-utilization/src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

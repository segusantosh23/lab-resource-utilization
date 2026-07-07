@echo off
mvnw.cmd -Dspring-boot.run.arguments=--server.port=8081 -DskipTests clean spring-boot:run > run.log 2>&1

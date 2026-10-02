# Multi-stage Docker build for Spring Boot 3 + Java 21
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build jar
COPY src src
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Render injects PORT environment variable
ENV PORT=5000
EXPOSE ${PORT}

# Run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]

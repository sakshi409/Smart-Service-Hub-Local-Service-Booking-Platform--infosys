# Step 1: Build the application
FROM eclipse-temurin:22-jdk-alpine AS build

WORKDIR /app

# Copy maven files
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Fix permissions
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source
COPY src src

# Build JAR
RUN ./mvnw clean package -DskipTests

# Step 2: Run the application
FROM eclipse-temurin:22-jdk-alpine

WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]

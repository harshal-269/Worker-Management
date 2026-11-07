
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline

COPY src ./src

RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Add TiDB CA certificate to Java truststore
COPY isrgrootx1.pem /tmp/tidb-ca.pem

RUN keytool -importcert \
    -cacerts \
    -storepass changeit \
    -noprompt \
    -alias tidb-root-ca \
    -file /tmp/tidb-ca.pem \
    && rm /tmp/tidb-ca.pem

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

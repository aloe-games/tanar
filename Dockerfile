FROM maven:3.6.1-jdk-7 AS builder
WORKDIR /app
COPY src/ src/
COPY pom.xml pom.xml
RUN mvn -X install

FROM tomcat:7.0.109
COPY --from=builder /app/target/Tanar.war /usr/local/tomcat/webapps/ROOT.war

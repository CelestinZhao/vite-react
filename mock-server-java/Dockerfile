# 多阶段构建：第一阶段用 Maven 镜像编译，第二阶段用 JRE 运行
# 使用方式：
#   docker build -t mock-server-java .
#   docker run -p 3001:3001 -v $(pwd)/data:/app/data mock-server-java
#
# 或用 docker-compose up（推荐）

# ---- Stage 1: 构建 ----
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

# 先只拷贝 pom.xml 利用 Docker 层缓存
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 再拷贝源码并打包
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Stage 2: 运行 ----
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# SQLite 需要的 C 库（Alpine 默认用 musl，sqlite-jdbc 需要 glibc 兼容层）
RUN apk add --no-cache libstdc++

# 从构建阶段拷贝 jar
COPY --from=builder /build/target/mock-server-java.jar /app/app.jar

# 暴露端口
EXPOSE 3001

# 数据目录（通过 volume 持久化 SQLite）
VOLUME ["/app/data"]

# JVM 参数：容器环境默认按容器内存限制分配堆
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

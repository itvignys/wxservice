---
name: springboot-wechat-openid-api
overview: 创建一个 Spring Boot 2.7.x + JDK 11 项目，提供 RESTful API 接口供微信小程序调用，获取并存储用户的 openid。项目使用 Maven 构建，MySQL 数据库存储用户信息。
todos:
  - id: create-maven-project
    content: 创建 Maven 项目结构和 pom.xml 依赖配置
    status: completed
  - id: config-application
    content: 配置 application.yml 数据库连接和微信参数
    status: completed
    dependencies:
      - create-maven-project
  - id: create-wechat-config
    content: 创建微信配置类读取配置文件
    status: completed
    dependencies:
      - create-maven-project
  - id: create-entity-mapper
    content: 创建 WxUser 实体类和 MyBatis-Plus Mapper
    status: completed
    dependencies:
      - create-maven-project
      - config-application
  - id: create-wechat-util
    content: 创建微信 API 调用工具类
    status: completed
    dependencies:
      - create-wechat-config
  - id: create-service-layer
    content: 创建 Service 业务逻辑层
    status: completed
    dependencies:
      - create-entity-mapper
      - create-wechat-util
  - id: create-rest-controller
    content: 创建 REST Controller 提供 API 接口
    status: completed
    dependencies:
      - create-service-layer
  - id: create-database
    content: 使用 MySQL MCP 创建数据库表
    status: completed
---

## 产品概述

创建一个 Spring Boot Web 项目，提供 RESTful API 接口供微信小程序调用，获取并存储小程序用户的 openid。

## 核心功能

- **微信登录 API**: 接收小程序传来的 code，调用微信接口换取 openid 和 session_key
- **用户记录存储**: 将获取到的 openid 存储到 MySQL 数据库
- **用户查询 API**: 支持通过 openid 查询用户信息
- **配置管理**: 使用 application.yml 配置微信参数，运行时可配置

## 技术栈

- **Java 版本**: JDK 11
- **框架**: Spring Boot 2.7.x
- **构建工具**: Maven
- **数据库**: MySQL
- **ORM**: MyBatis-Plus 3.5.x
- **HTTP 客户端**: Spring RestTemplate（调用微信 API）

## 架构设计

采用分层架构：

- **Controller 层**: 处理 HTTP 请求，提供 RESTful API
- **Service 层**: 业务逻辑处理，调用微信接口和数据库操作
- **Mapper 层**: 数据库访问层
- **Config 层**: 配置类，管理微信参数

## API 接口设计

| 方法 | 路径 | 描述 | 请求参数 |
| --- | --- | --- | --- |
| POST | /api/user/login | 小程序登录 | code (from mini program) |
| GET | /api/user/{openid} | 查询用户 | openid (path) |


## 数据库设计

```sql
CREATE TABLE wx_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(64) NOT NULL UNIQUE COMMENT '微信openid',
    session_key VARCHAR(64) COMMENT '会话密钥',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 目录结构

```
wx-login-service/
├── pom.xml
├── src/main/java/com/example/wxlogin/
│   ├── WxLoginApplication.java        # 启动类
│   ├── config/
│   │   └── WechatConfig.java           # 微信配置类
│   ├── controller/
│   │   └── UserController.java         # REST 接口
│   ├── service/
│   │   ├── UserService.java            # 服务接口
│   │   └── impl/UserServiceImpl.java   # 服务实现
│   ├── mapper/
│   │   └── UserMapper.java             # MyBatis Mapper
│   ├── entity/
│   │   └── WxUser.java                 # 用户实体类
│   └── util/
│       └── WechatUtil.java             # 微信 API 调用工具
├── src/main/resources/
│   ├── application.yml                 # 应用配置
│   └── mapper/UserMapper.xml           # Mapper XML
└── src/test/java/
    └── WxLoginApplicationTests.java     # 单元测试
```

## 实现说明

1. **微信登录流程**: 小程序前端调用 `wx.login()` 获取 code → 调用后端 API → 后端用 code 换 openid → 存储并返回
2. **配置管理**: 微信 AppID 和 AppSecret 使用 `${wx.appid}` 和 `${wx.secret}` 占位符，在 application.yml 中配置
3. **错误处理**: 统一异常处理，微信接口调用失败返回错误码

# Agent Extensions

- **@f4ww4z/mcp-mysql-server**: 用于创建数据库表和验证数据库连接
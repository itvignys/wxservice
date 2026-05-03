# 微信小程序登录服务

Spring Boot + MySQL + MyBatis-Plus 实现微信小程序获取 openid 的后端服务。

## 技术栈

- JDK 11
- Spring Boot 2.7.18
- Maven
- MySQL
- MyBatis-Plus 3.5.5

## 快速开始

### 1. 创建数据库

```sql
CREATE DATABASE wx_login CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wx_login;

CREATE TABLE wx_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(64) NOT NULL UNIQUE COMMENT '微信openid',
    session_key VARCHAR(64) COMMENT '会话密钥',
    unionid VARCHAR(64) COMMENT '微信 unionid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='微信小程序用户表';
```

### 2. 配置微信参数

编辑 `src/main/resources/application.yml` 或设置环境变量：

```yaml
wx:
  appid: your-appid-here
  secret: your-secret-here
```

或设置环境变量：
```bash
export WX_APPID=your-appid-here
export WX_SECRET=your-secret-here
```

### 3. 配置数据库连接

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/wx_login
    username: root
    password: your-password
```

或设置环境变量：
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=wx_login
export DB_USERNAME=root
export DB_PASSWORD=your-password
```

### 4. 编译运行

```bash
# 编译
mvn clean package -DskipTests

# 运行
java -jar target/wx-login-service-1.0.0.jar
```

## API 接口

### 1. 小程序登录

**接口**: `POST /api/user/login`

**请求参数**:
```json
{
    "code": "微信登录code"
}
```

**成功响应**:
```json
{
    "code": 0,
    "message": "登录成功",
    "data": {
        "id": 1,
        "openid": "oxxxxxxxxxxxxxx",
        "sessionKey": "xxxxx",
        "unionid": null,
        "createdAt": "2024-01-01T12:00:00",
        "updatedAt": "2024-01-01T12:00:00"
    }
}
```

**失败响应**:
```json
{
    "code": -1,
    "message": "错误信息",
    "data": null
}
```

### 2. 查询用户

**接口**: `GET /api/user/{openid}`

**成功响应**:
```json
{
    "code": 0,
    "message": "success",
    "data": {
        "id": 1,
        "openid": "oxxxxxxxxxxxxxx",
        "sessionKey": "xxxxx",
        "unionid": null,
        "createdAt": "2024-01-01T12:00:00",
        "updatedAt": "2024-01-01T12:00:00"
    }
}
```

## 小程序端调用示例

```javascript
// 小程序端调用
wx.login({
  success: function(res) {
    if (res.code) {
      wx.request({
        url: 'http://localhost:8080/api/user/login',
        method: 'POST',
        data: { code: res.code },
        success: function(res) {
          console.log('openid:', res.data.data.openid);
        }
      });
    }
  }
});
```

## 项目结构

```
wx-login-service/
├── pom.xml
├── src/main/java/com/example/wxlogin/
│   ├── WxLoginApplication.java        # 启动类
│   ├── config/
│   │   ├── WechatConfig.java           # 微信配置
│   │   └── RestTemplateConfig.java     # RestTemplate 配置
│   ├── controller/
│   │   └── UserController.java         # REST 接口
│   ├── dto/
│   │   ├── ApiResponse.java            # 统一响应格式
│   │   └── LoginRequest.java           # 登录请求 DTO
│   ├── entity/
│   │   └── WxUser.java                 # 用户实体
│   ├── exception/
│   │   └── GlobalExceptionHandler.java # 全局异常处理
│   ├── mapper/
│   │   └── WxUserMapper.java           # Mapper 接口
│   ├── service/
│   │   ├── UserService.java           # 服务接口
│   │   └── impl/UserServiceImpl.java  # 服务实现
│   └── util/
│       └── WechatUtil.java             # 微信 API 工具类
└── src/main/resources/
    └── application.yml                 # 应用配置
```

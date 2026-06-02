# GPU智修专家 - 后端部署手册

> 适用版本：v2.0+（含维修工单系统、AI对话持久化、RAG知识库）

---

## 一、环境准备

### 1.1 服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2核 | 4核+ |
| 内存 | 4GB | 8GB+ |
| 磁盘 | 20GB SSD | 50GB SSD |
| 系统 | CentOS 7+ / Ubuntu 20.04+ | Ubuntu 22.04 LTS |
| 网络 | 公网IP，开放 8080/8443 端口 | 域名 + HTTPS |

### 1.2 基础环境安装

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 JDK 17
sudo apt install openjdk-17-jdk -y
java -version

# 安装 MySQL 8.0
sudo apt install mysql-server-8.0 -y
sudo systemctl enable mysql
sudo systemctl start mysql

# 安装 Maven（如本地打包）
sudo apt install maven -y
mvn -version
```

### 1.3 安全配置（生产必做）

```bash
# MySQL 安全设置
sudo mysql_secure_installation

# 配置防火墙
sudo ufw allow 22/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8443/tcp
sudo ufw enable
```

---

## 二、数据库部署

### 2.1 创建数据库

```bash
mysql -u root -p

CREATE DATABASE gpu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gpu_user'@'%' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON gpu.* TO 'gpu_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### 2.2 执行 SQL 脚本（按顺序）

```bash
# 上传 SQL 文件到服务器（本地执行）
scp sql/init_data.sql root@服务器IP:/opt/wxservice/sql/
scp sql/init_conversation.sql root@服务器IP:/opt/wxservice/sql/
scp src/main/resources/sql/repair_order_tables.sql root@服务器IP:/opt/wxservice/sql/

# 服务器端执行
mysql -u gpu_user -p gpu < /opt/wxservice/sql/init_data.sql
mysql -u gpu_user -p gpu < /opt/wxservice/sql/init_conversation.sql
mysql -u gpu_user -p gpu < /opt/wxservice/sql/repair_order_tables.sql
```

> ⚠️ **注意**：`repair_order_tables.sql` 中的 `ALTER TABLE wx_user ADD COLUMN role` 只能执行一次。若重复执行会报错，可手动注释掉该语句后再执行。

### 2.3 验证数据库

```sql
mysql -u gpu_user -p gpu -e "SHOW TABLES;"
mysql -u gpu_user -p gpu -e "DESC wx_user;"
```

预期输出：
- 表列表包含：`wx_user`、`gpu_knowledge`、`company_info`、`ai_conversation`、`repair_order` 等
- `wx_user` 表包含 `role` 字段

---

## 三、应用配置

### 3.1 创建配置目录

```bash
sudo mkdir -p /opt/wxservice/config
sudo mkdir -p /opt/wxservice/logs
```

### 3.2 编辑外部配置文件

创建 `/opt/wxservice/config/application-prod.yml`：

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/gpu?useUnicode=true&characterEncoding=utf-8&useSSL=true&serverTimezone=Asia/Shanghai
    username: gpu_user
    password: YourStrongPassword123!

# 微信小程序配置（必须与当前小程序一致）
wx:
  appid: wxb6880b9a67c307a0
  secret: 7fe4c9899bd1678662b20087960be7b1

# 管理后台权限（必须替换为实际运营人员 openid）
admin:
  allowed-openids:
    - "oXXXXXXXXXXXXXXXXXXXXXXXX"

# 元宝AI配置（生产环境通过环境变量注入）
yuanbao:
  api-key: ${YUANBAO_API_KEY}
```

> 🔴 **关键配置项**：
> - `admin.allowed-openids`：**必须**填入实际运营人员的 openid，否则管理后台无法进入
> - 获取 openid 方法：打开小程序 → 查看开发者工具控制台登录成功日志 → 复制 `o` 开头的字符串

---

## 四、打包与部署

### 4.1 本地打包（开发机）

```bash
cd /Users/wpshi/Documents/GitHub/wxservice/wx-login-service

# 清理并打包
mvn clean package -DskipTests

# 生成的 jar 文件位置
target/wx-login-service-*.jar
```

### 4.2 上传到服务器

```bash
# 上传 jar 包
scp target/wx-login-service-*.jar root@服务器IP:/opt/wxservice/

# 上传配置文件
scp config/application-prod.yml root@服务器IP:/opt/wxservice/config/
```

### 4.3 服务器目录结构

```
/opt/wxservice/
├── wx-login-service-2.0.0.jar   # 应用包
├── config/
│   └── application-prod.yml     # 生产配置
├── sql/
│   ├── init_data.sql
│   ├── init_conversation.sql
│   └── repair_order_tables.sql
└── logs/
    └── app.log                   # 运行日志
```

---

## 五、启动服务

### 5.1 方式一：直接启动（调试用）

```bash
cd /opt/wxservice
java -jar wx-login-service-*.jar \
  --spring.config.location=./config/application-prod.yml
```

### 5.2 方式二：后台运行（生产用）

```bash
cd /opt/wxservice
nohup java -jar wx-login-service-*.jar \
  --spring.config.location=./config/application-prod.yml \
  > logs/app.log 2>&1 &

echo $! > app.pid
```

### 5.3 方式三：systemd 服务（推荐）

创建 `/etc/systemd/system/wxservice.service`：

```ini
[Unit]
Description=GPU智修专家后端服务
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/wxservice
ExecStart=/usr/bin/java -jar /opt/wxservice/wx-login-service-*.jar --spring.config.location=/opt/wxservice/config/application-prod.yml
Restart=always
RestartSec=10
StandardOutput=append:/opt/wxservice/logs/app.log
StandardError=append:/opt/wxservice/logs/app.log

[Install]
WantedBy=multi-user.target
```

启用并启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable wxservice
sudo systemctl start wxservice
sudo systemctl status wxservice
```

常用命令：
```bash
sudo systemctl restart wxservice   # 重启
sudo systemctl stop wxservice      # 停止
sudo journalctl -u wxservice -f    # 查看日志
```

---

## 六、验证部署

### 6.1 检查进程与端口

```bash
# 检查进程
ps aux | grep wx-login-service

# 检查端口
netstat -tlnp | grep 8080
ss -tlnp | grep 8080

# 查看启动日志
tail -f /opt/wxservice/logs/app.log
```

### 6.2 API 接口测试

```bash
# 健康检查
curl http://localhost:8080/actuator/health

# 知识库列表
curl http://localhost:8080/api/knowledge/list?category=显示类

# 发送验证码（演示模式会直接返回验证码）
curl -X POST http://localhost:8080/api/user/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'

# App 登录
curl -X POST http://localhost:8080/api/user/login/app \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","verifyCode":"123456"}'
```

### 6.3 Nginx 反向代理（推荐）

```nginx
server {
    listen 80;
    server_name gpu.yuboshi.club;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gpu.yuboshi.club;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

---

## 七、版本升级

### 7.1 平滑升级流程

```bash
# 1. 备份当前版本
mv /opt/wxservice/wx-login-service-*.jar /opt/wxservice/backup/

# 2. 上传新版本 jar
scp target/wx-login-service-*.jar root@服务器IP:/opt/wxservice/

# 3. 执行数据库增量脚本（如有）
mysql -u gpu_user -p gpu < /opt/wxservice/sql/migrate_v2.x.sql

# 4. 重启服务
sudo systemctl restart wxservice

# 5. 验证
sleep 5
curl http://localhost:8080/actuator/health
```

### 7.2 回滚方案

```bash
# 停止服务
sudo systemctl stop wxservice

# 恢复旧版本
rm /opt/wxservice/wx-login-service-*.jar
mv /opt/wxservice/backup/wx-login-service-*.jar /opt/wxservice/

# 启动服务
sudo systemctl start wxservice
```

---

## 八、常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 端口 8080 被占用 | 其他服务占用 | `lsof -i:8080` 查找并关闭，或修改 `server.port` |
| 数据库连接失败 | MySQL 未启动或配置错误 | `sudo systemctl start mysql`，检查用户名密码 |
| 微信登录失败 | appid/secret 不正确 | 确认 `wx.appid` 与当前小程序一致 |
| 管理后台无法进入 | `allowed-openids` 未配置 | 填入正确的运营人员 openid |
| AI 对话无响应 | 元宝 API Key 失效 | 检查 `yuanbao.api-key` 是否过期 |
| 短信发送失败 | 未接入短信网关 | 演示环境验证码直接返回；生产需接入阿里云/腾讯云短信 |
| OutOfMemoryError | JVM 内存不足 | 启动参数增加 `-Xms512m -Xmx2g` |

### JVM 内存调优

```bash
java -Xms512m -Xmx2g -jar wx-login-service-*..jar \
  --spring.config.location=./config/application-prod.yml
```

---

## 九、监控与日志

### 9.1 日志查看

```bash
# 实时日志
tail -f /opt/wxservice/logs/app.log

# 按日期查看
grep "2026-06-02" /opt/wxservice/logs/app.log | less

# 错误日志
grep "ERROR" /opt/wxservice/logs/app.log | tail -20
```

### 9.2 日志切割（logrotate）

创建 `/etc/logrotate.d/wxservice`：

```
/opt/wxservice/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        systemctl reload wxservice > /dev/null 2>&1 || true
    endscript
}
```

---

## 十、联系与反馈

- 技术问题：查看 `logs/app.log` 中的 ERROR 级别日志
- 配置问题：检查 `application-prod.yml` 中的关键配置项
- 数据库问题：使用 `mysql -u gpu_user -p gpu` 登录排查

---

**文档版本**：v2.0  
**最后更新**：2026-06-02

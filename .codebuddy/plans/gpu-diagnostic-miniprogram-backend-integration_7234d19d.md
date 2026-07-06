---
name: gpu-diagnostic-miniprogram-backend-integration
overview: 将GPU智修专家小程序对接Java后端服务，包括用户登录存储、知识库数据库化、元宝AI对话接入三大模块
design:
  architecture:
    component: tdesign
  styleKeywords:
    - 技术专业感
    - 深蓝主色调(#065A82)
    - 清晰的信息层级
    - 流畅的状态过渡动画
    - 友好的加载与空态设计
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 34px
      weight: 600
    subheading:
      size: 28px
      weight: 600
    body:
      size: 16px
      weight: 400
  colorSystem:
    primary:
      - "#065A82"
      - "#0A7BA4"
      - "#0E9BC8"
    background:
      - "#F5F7FA"
      - "#FFFFFF"
      - "#E8F4F8"
    text:
      - "#1A1A1A"
      - "#666666"
      - "#999999"
    functional:
      - "#02C39A"
      - "#FF3B30"
      - "#FF9500"
      - "#5856D6"
todos:
  - id: db-schema-init
    content: 使用 [@f4ww4z/mcp-mysql-server] 创建 gpu_knowledge 和 company_info 表，扩展 wx_user 字段，导入 17 条知识库初始数据
    status: completed
  - id: backend-user-service
    content: 扩展 Java 后端用户模块：WxUser 实体新增字段、UserProfile 更新接口、CompanyInfo CRUD
    status: completed
    dependencies:
      - db-schema-init
  - id: backend-knowledge-api
    content: 实现 Java 后端知识库模块：GpuKnowledge 实体/Mapper/Service/KnowledgeController（列表/搜索/分类/详情接口）
    status: completed
    dependencies:
      - db-schema-init
  - id: backend-yuanbao-ai
    content: 实现 Java 后端元宝 AI 模块：YuanbaoConfig 配置类、YuanbaoAiService（Prompt组装/元宝API调用/上下文管理）、AiController 中转接口
    status: completed
    dependencies:
      - db-schema-init
  - id: miniprogram-api-layer
    content: 新建小程序端 API 层：utils/constants.js（常量配置）、utils/api.js（统一请求封装含token/错误处理/环境切换）
    status: completed
  - id: miniprogram-integration
    content: 改造小程序端各页面：app.js(自动登录)、chatbot.js(对接真实AI接口)、knowledge.js(调API)、index.js(用户联动)、service.js(表单提交)
    status: completed
    dependencies:
      - miniprogram-api-layer
      - backend-user-service
      - backend-knowledge-api
      - backend-yuanbao-ai
---

## Product Overview

对 GPU智修专家 微信小程序进行后端集成升级，将当前纯前端本地数据存储的模式改造为前后端分离架构。在现有 wx-login-service Java 后端基础上扩展三大能力：用户信息持久化存储、知识库数据云端化与API化、元宝AI智能对话接入。

## Core Features

1. **用户系统对接**: 小程序端通过 `wx.login()` 获取 code，调用 Java 后端 `/api/user/login` 接口完成登录并获取 openid，用户信息（userInfo、companyInfo、serviceLevel 等）从本地 Storage 迁移至数据库持久化存储，后端扩展 WxUser 实体字段以支持更多用户属性
2. **知识库结构化存储与 API 化**: 将 `knowledge.js` 中 17 条 GPU 维修知识数据（含 id/category/question/causes/diagnosis/solution/difficulty/cost/successRate）迁移至 MySQL 数据库，后端提供 RESTful API（列表查询/分类筛选/关键词搜索/详情获取），小程序端 knowledge 页面和 chatbot 页面改为调用 API 获取数据，替代本地 require 方式
3. **元宝 AI 对话接入**: 在 Java 后端新增 AI 模块，通过 HTTP 调用元宝大模型聊天补全接口（`https://hunyuan.cloud.tencent.com/v1/chat/completions`），后端作为中转代理层处理鉴权、prompt 组装（注入GPU诊断知识库上下文）、对话历史管理；小程序端 chatbot.js 的 `callBackendAI()` 方法对接真实后端 `/api/ai/chat` 接口，移除 mock 兜底逻辑

## Tech Stack

- **后端**: 现有 Spring Boot 2.7.18 + MyBatis-Plus 3.5.5 + MySQL 扩展
- **前端**: 微信小程序原生开发（现有架构不变）
- **AI 能力**: 元宝（混元）大模型 API 通过 RestTemplate 调用
- **数据库**: MySQL（已有 gpu 数据库）

## Tech Architecture

### 系统整体架构

```
微信小程序 (Miniprogram)
  |-- app.js (启动时调用登录接口)
  |-- pages/chatbot/chatbot.js (调用 /api/ai/chat)
  |-- pages/knowledge/knowledge.js (调用 /api/knowledge/*)
  |-- pages/service/service.js (提交企业信息到后端)
  
Java 后端 (Spring Boot :8080)
  |-- UserController (已有 - 登录/查询用户)
  |-- KnowledgeController [NEW] - 知识库 CRUD
  |-- AiController [NEW] - 元宝AI中转
  |-- CompanyController [NEW] - 企业信息管理
  |-- YuanbaoAiService [NEW] - 元宝API调用
  
MySQL (gpu 数据库)
  |-- wx_user (扩展字段)
  |-- gpu_knowledge [NEW] - 知识库表
  |-- company_info [NEW] - 企业信息表
```

### 数据流

```
用户打开小程序 -> wx.login() -> POST /api/user/login -> 数据库存储/返回用户信息
知识库页面加载 -> GET /api/knowledge/list -> 查询 gpu_knowledge 表 -> 返回列表
搜索/筛选 -> GET /api/knowledge/search?keyword=xx&category=xx -> 条件查询
用户发送消息 -> POST /api/ai/chat -> 后端组装prompt -> 调用元宝API -> 流式/非流式返回
提交企业信息 -> POST /api/company/save -> 存入 company_info 表
```

## Implementation Details

### 核心目录结构（变更部分）

```
wx-login-service/
├── pom.xml                                          # [MODIFY] 新增依赖(如有需要)
├── src/main/java/com/example/wxlogin/
│   ├── config/
│   │   ├── WechatConfig.java                        # 已有
│   │   ├── RestTemplateConfig.java                  # 已有
│   │   └── YuanbaoConfig.java                       # [NEW] 元宝AI配置(appId/apiKey/模型/endpoint)
│   ├── controller/
│   │   ├── UserController.java                      # 已有 - 扩展用户信息更新接口
│   │   ├── KnowledgeController.java                 # [NEW] 知识库REST接口
│   │   ├── AiController.java                        # [NEW] AI对话中转接口
│   │   └── CompanyController.java                   # [NEW] 企业信息接口
│   ├── dto/
│   │   ├── ApiResponse.java                         # 已有
│   │   ├── LoginRequest.java                        # 已有
│   │   ├── ChatRequest.java                         # [NEW] AI对话请求DTO
│   │   ├── KnowledgeSearchRequest.java              # [NEW] 知识库搜索请求DTO
│   │   └── CompanyInfoDTO.java                      # [NEW] 企业信息DTO
│   ├── entity/
│   │   ├── WxUser.java                              # [MODIFY] 扩展字段(nickname/avatar/phone等)
│   │   ├── GpuKnowledge.java                        # [NEW] 知识库实体
│   │   └── CompanyInfo.java                         # [NEW] 企业信息实体
│   ├── service/
│   │   ├── UserService.java/UserServiceImpl.java    # [MODIFY] 扩展用户信息更新方法
│   │   ├── KnowledgeService.java/KnowledgeServiceImpl.java  # [NEW]
│   │   ├── YuanbaoAiService.java/YuanbaoAiServiceImpl.java # [NEW]
│   │   └── CompanyService.java/CompanyServiceImpl.java      # [NEW]
│   ├── mapper/
│   │   ├── WxUserMapper.java                        # 已有
│   │   ├── GpuKnowledgeMapper.java                 # [NEW]
│   │   └── CompanyInfoMapper.java                   # [NEW]
│   └── util/
│       ├── WechatUtil.java                          # 已有
│       └── YuanbaoAiUtil.java                       # [NEW] 元宝API调用工具
├── src/main/resources/
│   ├── application.yml                              # [MODIFY] 新增元宝配置项
│   └── sql/
│       └── init_data.sql                            # [新建目录+文件] 建表SQL+初始数据导入

gpu-diagnostic-miniprogram/
├── app.js                                           # [MODIFY] onLaunch中调用登录接口
├── utils/
│   ├── util.js                                      # 已有
│   ├── api.js                                       # [NEW] 统一API请求封装( baseURL/token管理/拦截器)
│   └── constants.js                                 # [NEW] 常量定义(API地址等)
├── data/
│   └── knowledge.js                                 # [保留但不再被require, 作为数据迁移参考]
├── pages/chatbot/chatbot.js                         # [MODIFY] callBackendAI对接真实API, searchKnowledgeBase可选改API
├── pages/knowledge/knowledge.js                     # [MODIFY] loadData改为调API
├── pages/index/index.js                             # [MODIFY] loadUserData从API获取
└── pages/service/service.js                         # [MODIFY] submitForm调API提交
```

### 关键实现说明

**1. 用户系统对接**

- 扩展 `WxUser` 实体: 新增 nickname、avatar_url、phone 字段; 新增 `UserInfo` 关联表或JSON字段存 companyInfo
- 小程序端 `app.js` onLaunch 时调用 `wx.login()` -> `POST /api/user/login`, 将返回的 userInfo 存入 globalData 和 Storage(作为缓存)
- 新增 `PUT /api/user/profile` 接口允许更新用户资料

**2. 知识库结构化存储**

- 建表 `gpu_knowledge`: id(BIGINT AUTO_INCREMENT), category(VARCHAR), question(VARCHAR), causes(TEXT), diagnosis(TEXT), solution(TEXT), difficulty(VARCHAR), cost(VARCHAR), success_rate(VARCHAR), created_at, updated_at
- 编写 SQL 脚本将 knowledge.js 的17条数据 INSERT 到表中
- KnowledgeController 提供: GET /api/knowledge/list(分页), GET /api/knowledge/categories(分类列表+统计), GET /api/knowledge/search?keyword=&category=(全文搜索), GET /api/knowledge/{id}(详情)
- 小程序端新增 utils/api.js 封装 wx.request, 统一 baseURL、header(Authorization token)、错误处理

**3. 元宝AI接入**

- 后端新增 YuanbaoConfig: 配置 appId、apiKey、model(hunyuan-pro/turbo)、endpoint URL
- YuanbaoAiService: 使用 RestTemplate 调用元宝 Chat Completions API, 支持流式/非流式; 组装 system prompt 注入 GPU 诊断专家角色; 拼接历史对话上下文
- AiController: POST /api/ai/chat 接收 {message, context[], scene}, 鉴权(token/openid), 调用服务返回
- 小程序端 chatbot.js 的 callBackendAI() 修改为正确的后端地址, 移除 mockYuanbaoReply 兜底, 改为友好错误提示

## 设计概述

本次改造主要涉及后端服务层和小程序端的数据交互层，不涉及大规模 UI 变更。设计重点在于：API 请求封装模块的建立、各页面对接 API 后的交互状态管理（loading、空态、异常态）、以及 AI 对话界面的体验优化。

## 页面规划

### Page 1: app.js 启动流程（改造）

**Block 1 - 自动静默登录**: 小程序 onLaunch 时自动执行 wx.login 获取 code，调用后端登录接口，整个过程对用户无感。登录失败时降级为游客模式（本地缓存），不影响核心浏览功能。
**Block 2 - 全局状态初始化**: 登录成功后将 userInfo 写入 globalData，后续所有页面通过 getApp().globalData.userInfo 获取当前用户身份。

### Page 2: 智能检测页 chatbot（核心改造）

**Block 1 - 对话消息列表**: 保持现有的消息气泡 UI 不变。新增 AI 正在输入状态的打字动画指示器（三个跳动的点），替代当前的 isLoading 文字提示。AI 消息来源标识：知识库匹配显示「来自知识库」标签，元宝AI回复显示「AI智能分析」标签。
**Block 2 - 输入区域**: 保持现有布局不变，输入框、发送按钮、图片上传按钮保持原位。
**Block 3 - 快捷问题入口**: 6个快捷症状按钮保持不变，点击后直接发送并触发 API 调用链路（先知识库搜索 -> 再 AI 对话）。
**Block 4 - 服务升级入口**: 「联系专家」「预约上门」按钮保持不变，但需校验用户是否已登录（未登录时弹出引导登录提示）。

### Page 3: 知识库页 knowledge（数据源改造）

**Block 1 - 分类标签栏**: 6个分类 Tab 保持原有颜色体系不变。「全部」Tab 显示总数量角标。切换 Tab 时触发分类筛选 API 调用，带 loading 动画。
**Block 2 - 搜索栏**: 顶部搜索框保持不变，输入关键词后 300ms 防抖触发搜索 API。增加搜索结果高亮（关键词标红）。
**Block 3 - 知识卡片列表**: 卡片 UI 保持不变（标题、分类标签、难度星级、成功率）。数据源从本地require改为 API 请求，支持下拉刷新（重新拉取 API）和上拉加载更多（如果未来数据量增大）。空状态展示引导插画。
**Block 4 - 详情弹窗**: 点击卡片弹出详情面板，展示完整的 causes/diagnosis/solution 信息，底部保留「咨询专家」和「去AI诊断」两个操作按钮。

### Page 4: 企业服务页 service（表单提交改造）

**Block 1 - 企业信息表单**: 所有表单字段保持不变（企业名称、信用代码、联系人、手机号、地址、显卡数量、服务需求）。提交按钮点击后调用后端 API，提交中按钮变为 disabled + loading 态。
**Block 2 - 提交反馈**: 成功后 toast 提示「提交成功」，1.5秒后自动返回上一页；失败时展示具体错误信息。

### Page 5: 首页 index（数据联动改造）

**Block 1 - 欢迎区域**: 如果用户已登录，显示「您好，{昵称}」的个性化欢迎语；未登录显示默认欢迎语。
**Block 2 - 常见问题快捷入口**: 6个常见问题卡片保持不变，点击跳转到知识库或聊天页面。
**Block 3 - 数据统计区**: 知识库数量从 API 实时获取，诊断次数等可后续对接后端统计接口。

## 全局组件/工具

### api.js 统一请求模块

封装 wx.request，包含：

- baseURL 配置（区分开发/生产环境）
- 请求拦截器：自动附加 Authorization token
- 响应拦截器：统一处理 code !== 0 的错误情况
- 请求队列：防止重复提交
- 超时控制：默认 10 秒

### MCP

- **@f4ww4z/mcp-mysql-server**
- Purpose: 连接 MySQL 数据库，创建新表（gpu_knowledge、company_info），修改现有表结构（wx_user 扩展字段），插入 knowledge.js 中的 17 条初始数据
- Expected outcome: 数据库表结构就绪，初始数据已导入，后续代码可直接使用这些表

### SubAgent

- **code-explorer**
- Purpose: 在实施过程中深度探索项目中剩余未读的关键文件（如各页面的 wxml/wxss 模板文件、配置文件等），确保修改方案与现有 UI 结构完全兼容
- Expected outcome: 精确了解每个需要修改的前端文件的模板结构和样式约定，避免遗漏
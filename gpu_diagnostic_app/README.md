# GPU智修专家 - Flutter App

基于原微信小程序功能，使用 Flutter 构建的 Android + iOS 双端应用。

## 技术栈

| 层级 | 技术 |
|------|------|
| UI 框架 | Flutter 3.x |
| 状态管理 | flutter_riverpod |
| 网络请求 | dio + dio_smart_retry |
| 本地存储 | shared_preferences |
| 图片选择 | image_picker |

## 项目结构

```
lib/
├── main.dart              # 应用入口
├── app.dart               # MaterialApp + 底部导航
├── core/                  # 基础设施层
│   ├── constants/         # 常量配置（API地址、Storage Keys）
│   ├── network/           # Dio 封装 + 响应模型
│   ├── storage/           # SharedPreferences 封装
│   └── models/            # 数据模型（UserInfo、GpuKnowledge、ChatMessage、CompanyInfo）
├── providers/             # Riverpod 全局状态
│   ├── auth_provider.dart
│   ├── chat_provider.dart
│   └── knowledge_provider.dart
├── features/              # 业务页面
│   ├── home/              # 首页
│   ├── chatbot/           # AI检测（核心）
│   ├── knowledge/         # 知识库
│   ├── tools/             # 工具
│   ├── profile/           # 我的
│   ├── service/           # 企业认证（非Tab）
│   └── admin/             # 管理后台（非Tab）
└── shared/widgets/        # 公共组件
    ├── service_progress_bar.dart
    ├── chat_bubble.dart
    ├── quick_symptoms_bar.dart
    └── chat_input_area.dart
```

## 运行步骤

```bash
# 1. 进入项目
cd gpu_diagnostic_app

# 2. 安装依赖
flutter pub get

# 3. 生成代码（Freezed/Riverpod）
flutter pub run build_runner build --delete-conflicting-outputs

# 4. 运行
flutter run

# 5. 打包 APK
flutter build apk --release

# 6. 打包 iOS
flutter build ios --release
```

## 后端对接说明

- **API 完全复用**原微信小程序后端，BaseURL: `https://gpu.yuboshi.club:8443`
- App 登录需新增接口：`POST /api/user/login/app`（手机号+验证码）
- 如需保留微信登录，需申请[微信开放平台](https://open.weixin.qq.com/)移动应用

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/constants/app_constants.dart';
import 'core/models/user_info.dart';
import 'core/network/api_client.dart';
import 'core/storage/local_storage.dart';
import 'features/auth/login_page.dart';
import 'features/home/home_page.dart';
import 'features/chatbot/chatbot_page.dart';
import 'features/knowledge/knowledge_page.dart';
import 'features/tools/tools_page.dart';
import 'features/profile/profile_page.dart';
import 'features/service/service_page.dart';
import 'features/admin/admin_page.dart';
import 'providers/auth_provider.dart';

class GpuDiagnosticApp extends StatelessWidget {
  const GpuDiagnosticApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF065A82),
          primary: const Color(0xFF065A82),
          secondary: const Color(0xFF02C39A),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF065A82),
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: true,
        ),
        scaffoldBackgroundColor: const Color(0xFFF5F7FA),
        cardTheme: CardTheme(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          type: BottomNavigationBarType.fixed,
          selectedItemColor: Color(0xFF065A82),
          unselectedItemColor: Color(0xFF999999),
          backgroundColor: Colors.white,
        ),
      ),
      home: const AuthGate(),
      routes: {
        '/main': (context) => const MainPage(),
        '/login': (context) => const LoginPage(),
        '/service': (context) => const ServicePage(),
        '/admin': (context) => const AdminPage(),
      },
    );
  }
}

/// 登录态 gate：检查本地存储的 openid，决定是否跳转登录页
class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FutureBuilder(
      future: _checkLogin(ref),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        final isLoggedIn = snapshot.data ?? false;
        return isLoggedIn ? const MainPage() : const LoginPage();
      },
    );
  }

  Future<bool> _checkLogin(WidgetRef ref) async {
    final openid = LocalStorage.getString(AppConstants.storageOpenid);
    if (openid != null && openid.isNotEmpty) {
      ApiClient.setAuthHeaders(null, openid);
      // 尝试恢复用户信息
      final userJson = LocalStorage.getString(AppConstants.storageUserInfo);
      if (userJson != null && userJson.isNotEmpty) {
        try {
          ref.read(authProvider.notifier).state = AuthState(
            status: AuthStatus.authenticated,
            user: UserInfo.fromJsonString(userJson),
          );
        } catch (_) {}
      }
      return true;
    }
    return false;
  }
}

/// 主页面（含底部 TabBar 导航）
class MainPage extends StatefulWidget {
  const MainPage({super.key});

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    HomePage(),
    ChatbotPage(),
    KnowledgePage(),
    ToolsPage(),
    ProfilePage(),
  ];

  final List<BottomNavigationBarItem> _items = const [
    BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: '首页'),
    BottomNavigationBarItem(icon: Icon(Icons.smart_toy_outlined), activeIcon: Icon(Icons.smart_toy), label: 'AI检测'),
    BottomNavigationBarItem(icon: Icon(Icons.menu_book_outlined), activeIcon: Icon(Icons.menu_book), label: '知识库'),
    BottomNavigationBarItem(icon: Icon(Icons.build_outlined), activeIcon: Icon(Icons.build), label: '工具'),
    BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: '我的'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        items: _items,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}

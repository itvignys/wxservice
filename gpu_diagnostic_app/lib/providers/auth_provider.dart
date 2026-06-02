import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/user_info.dart';
import '../core/storage/local_storage.dart';

/// 登录状态
enum AuthStatus { initial, loading, authenticated, unauthenticated }

/// 认证状态
class AuthState {
  final AuthStatus status;
  final UserInfo? user;
  final String? error;

  AuthState({this.status = AuthStatus.initial, this.user, this.error});

  AuthState copyWith({AuthStatus? status, UserInfo? user, String? error}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      error: error,
    );
  }

  bool get isLoggedIn => status == AuthStatus.authenticated && user != null;
  bool get isLoading => status == AuthStatus.loading;
}

/// 认证状态管理器
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState()) {
    _loadLocalUser();
  }

  void _loadLocalUser() {
    final userJson = LocalStorage.getString('userInfo');
    if (userJson != null && userJson.isNotEmpty) {
      // TODO: 解析 JSON 为 UserInfo
      // state = AuthState(status: AuthStatus.authenticated, user: user);
    } else {
      state = AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> login(String phone, String verifyCode) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      // TODO: 调用 ApiClient.post('/api/user/login/app', ...)
      await Future.delayed(const Duration(seconds: 1));
      state = state.copyWith(status: AuthStatus.authenticated);
    } catch (e) {
      state = state.copyWith(status: AuthStatus.unauthenticated, error: e.toString());
    }
  }

  Future<void> logout() async {
    await LocalStorage.remove('token');
    await LocalStorage.remove('openid');
    await LocalStorage.remove('userInfo');
    state = AuthState(status: AuthStatus.unauthenticated);
  }
}

/// 全局 Auth Provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

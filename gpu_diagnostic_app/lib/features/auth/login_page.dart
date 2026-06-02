import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_constants.dart';
import '../../core/constants/api_constants.dart';
import '../../core/models/user_info.dart' as model;
import '../../core/network/api_client.dart';
import '../../core/storage/local_storage.dart';
import '../../providers/auth_provider.dart';
import '../home/home_page.dart';

/// App 登录页（手机号 + 验证码）
class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  bool _isLoading = false;
  bool _isSendingCode = false;
  int _countDown = 0;
  Timer? _timer;

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  /// 发送验证码
  Future<void> _sendCode() async {
    final phone = _phoneController.text.trim();
    if (!RegExp(r'^1[3-9]\d{9}$').hasMatch(phone)) {
      _showSnackBar('请输入正确的11位手机号');
      return;
    }

    setState(() => _isSendingCode = true);
    try {
      final response = await ApiClient.post<String>(
        ApiConstants.smsSend,
        data: {'phone': phone},
        fromJson: (data) => data?.toString() ?? '',
      );

      if (response.code == 0) {
        _showSnackBar('验证码已发送，演示模式: ${response.data}');
        setState(() => _countDown = 60);
        _timer?.cancel();
        _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
          if (_countDown <= 1) {
            timer.cancel();
          }
          setState(() => _countDown--);
        });
      } else {
        _showSnackBar(response.message);
      }
    } catch (e) {
      _showSnackBar('发送失败: $e');
    } finally {
      setState(() => _isSendingCode = false);
    }
  }

  /// 登录
  Future<void> _login() async {
    final phone = _phoneController.text.trim();
    final code = _codeController.text.trim();

    if (!RegExp(r'^1[3-9]\d{9}$').hasMatch(phone)) {
      _showSnackBar('请输入正确的手机号');
      return;
    }
    if (!RegExp(r'^\d{6}$').hasMatch(code)) {
      _showSnackBar('请输入6位验证码');
      return;
    }

    setState(() => _isLoading = true);
    try {
      final response = await ApiClient.post<model.UserInfo>(
        ApiConstants.userLoginApp,
        data: {'phone': phone, 'verifyCode': code},
        fromJson: (data) => model.UserInfo.fromJson(data),
      );

      if (response.code == 0 && response.data != null) {
        final user = response.data!;
        // 保存登录态
        await LocalStorage.setString(AppConstants.storageOpenid, user.openid);
        await LocalStorage.setString(AppConstants.storageUserInfo, user.toJsonString());
        ApiClient.setAuthHeaders(null, user.openid);
        ref.read(authProvider.notifier).state = AuthState(
          status: AuthStatus.authenticated,
          user: user,
        );

        if (mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const MainPage()),
            (route) => false,
          );
        }
      } else {
        _showSnackBar(response.message);
      }
    } catch (e) {
      _showSnackBar('登录失败: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showSnackBar(String msg) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), duration: const Duration(seconds: 2)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 60),
              const Text(
                '欢迎回来',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF065A82)),
              ),
              const SizedBox(height: 8),
              const Text(
                '请使用手机号登录 GPU智修专家',
                style: TextStyle(fontSize: 16, color: Color(0xFF999999)),
              ),
              const SizedBox(height: 48),
              // 手机号输入
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                maxLength: 11,
                decoration: InputDecoration(
                  labelText: '手机号',
                  hintText: '请输入11位手机号码',
                  prefixIcon: const Icon(Icons.phone_android),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  counterText: '',
                ),
              ),
              const SizedBox(height: 20),
              // 验证码输入
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _codeController,
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      decoration: InputDecoration(
                        labelText: '验证码',
                        hintText: '请输入6位验证码',
                        prefixIcon: const Icon(Icons.sms_outlined),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        counterText: '',
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 120,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: (_isSendingCode || _countDown > 0) ? null : _sendCode,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF065A82),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _isSendingCode
                          ? const SizedBox(
                              width: 20, height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Text(_countDown > 0 ? '$_countDown秒' : '获取验证码'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),
              // 登录按钮
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _login,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF065A82),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 24, height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('登录', style: TextStyle(fontSize: 18)),
                ),
              ),
              const Spacer(),
              const Center(
                child: Text(
                  '登录即表示您同意《服务协议》和《隐私政策》',
                  style: TextStyle(fontSize: 12, color: Color(0xFF999999)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

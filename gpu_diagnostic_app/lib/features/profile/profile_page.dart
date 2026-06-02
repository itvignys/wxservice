import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_constants.dart';
import '../../core/storage/local_storage.dart';
import '../../providers/auth_provider.dart';
import '../service/service_page.dart';
import '../admin/admin_page.dart';
import '../auth/login_page.dart';

/// 我的页面
class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // 用户信息头部
          SliverToBoxAdapter(
            child: _buildUserHeader(context, authState),
          ),
          // 服务统计
          SliverToBoxAdapter(
            child: _buildStatsGrid(),
          ),
          // 菜单列表
          SliverList(
            delegate: SliverChildListDelegate([
              _buildMenuSection('服务菜单', [
                _MenuItem(Icons.calendar_today, '预约记录', () {}),
                _MenuItem(Icons.assignment, '维修订单', () {}),
                _MenuItem(Icons.history, '咨询历史', () {}),
                _MenuItem(Icons.bookmark, '收藏知识', () {}),
              ]),
              _buildMenuSection('企业信息', [
                _MenuItem(Icons.business, '企业认证', () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const ServicePage()));
                }),
              ]),
              _buildMenuSection('运营', [
                _MenuItem(Icons.admin_panel_settings, '管理后台', () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminPage()));
                }),
              ]),
              _buildMenuSection('设置', [
                _MenuItem(Icons.cleaning_services, '清除缓存', () => _clearCache(context)),
                _MenuItem(Icons.info_outline, '关于我们', () {}),
                _MenuItem(Icons.feedback, '意见反馈', () {}),
              ]),
              _buildMenuSection('客服', [
                _MenuItem(Icons.phone, '客服热线 ${AppConstants.servicePhone}', () => _callPhone(context)),
              ]),
              const SizedBox(height: 24),
              if (authState.isLoggedIn)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => _logout(context, ref),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFFF3B30),
                        side: const BorderSide(color: Color(0xFFFF3B30)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text('退出登录'),
                    ),
                  ),
                ),
              const SizedBox(height: 24),
              Center(
                child: Text(
                  '版本 ${AppConstants.version}',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ),
              const SizedBox(height: 40),
            ]),
          ),
        ],
      ),
    );
  }

  Future<void> _logout(BuildContext context, WidgetRef ref) async {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('退出登录'),
        content: const Text('确定要退出当前账号吗？'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await LocalStorage.remove(AppConstants.storageToken);
              await LocalStorage.remove(AppConstants.storageOpenid);
              await LocalStorage.remove(AppConstants.storageUserInfo);
              ref.read(authProvider.notifier).state = const AuthState();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const LoginPage()),
                  (route) => false,
                );
              }
            },
            child: const Text('确定', style: TextStyle(color: Color(0xFFFF3B30))),
          ),
        ],
      ),
    );
  }

  Widget _buildUserHeader(BuildContext context, AuthState authState) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF065A82), Color(0xFF1C7293)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 36,
            backgroundColor: Colors.white24,
            child: authState.user?.avatarUrl != null
                ? ClipOval(child: Image.network(authState.user!.avatarUrl!))
                : const Icon(Icons.person, size: 36, color: Colors.white),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  authState.user?.nickname ?? '未登录',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '服务等级: L${authState.user?.serviceLevel ?? 0}',
                    style: const TextStyle(fontSize: 12, color: Colors.white70),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    final stats = [
      _ProfileStat('12', '咨询次数'),
      _ProfileStat('3', '预约记录'),
      _ProfileStat('2', '维修订单'),
    ];

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: stats.map((s) => _StatColumn(stat: s)).toList(),
        ),
      ),
    );
  }

  Widget _buildMenuSection(String title, List<_MenuItem> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            title,
            style: const TextStyle(fontSize: 14, color: Colors.grey, fontWeight: FontWeight.w500),
          ),
        ),
        Card(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: items.asMap().entries.map((entry) {
              final item = entry.value;
              final isLast = entry.key == items.length - 1;
              return Column(
                children: [
                  ListTile(
                    leading: Icon(item.icon, color: const Color(0xFF065A82)),
                    title: Text(item.label),
                    trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                    onTap: item.onTap,
                  ),
                  if (!isLast)
                    const Divider(height: 1, indent: 56, endIndent: 16),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  void _clearCache(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('清除缓存'),
        content: const Text('确定要清除所有本地缓存数据吗？'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('取消')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('缓存已清除')),
              );
            },
            child: const Text('确定'),
          ),
        ],
      ),
    );
  }

  Future<void> _callPhone(BuildContext context) async {
    final uri = Uri.parse('tel:${AppConstants.servicePhone}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('无法拨打电话')),
        );
      }
    }
  }
}

// === 数据模型 ===
class _ProfileStat {
  final String value;
  final String label;
  _ProfileStat(this.value, this.label);
}

class _MenuItem {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  _MenuItem(this.icon, this.label, this.onTap);
}

class _StatColumn extends StatelessWidget {
  final _ProfileStat stat;
  const _StatColumn({required this.stat});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(stat.value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(stat.label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }
}

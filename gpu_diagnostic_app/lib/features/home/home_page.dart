import 'package:flutter/material.dart';

/// 首页
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Banner 区域
          SliverToBoxAdapter(
            child: _buildBanner(),
          ),
          // 功能入口网格
          SliverToBoxAdapter(
            child: _buildFeatureGrid(context),
          ),
          // 服务数据统计
          SliverToBoxAdapter(
            child: _buildStatsCard(),
          ),
          // 常见故障快捷入口
          SliverToBoxAdapter(
            child: _buildQuickIssues(),
          ),
          // 企业信息提示
          SliverToBoxAdapter(
            child: _buildCompanyTip(),
          ),
          const SliverPadding(padding: EdgeInsets.only(bottom: 24)),
        ],
      ),
    );
  }

  Widget _buildBanner() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF065A82), Color(0xFF1C7293), Color(0xFF02C39A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'GPU智修专家',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 8),
          Text(
            '专业英伟达显卡故障诊断与维修服务',
            style: TextStyle(
              fontSize: 16,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureGrid(BuildContext context) {
    final features = [
      _Feature('AI诊断', Icons.smart_toy, Color(0xFF065A82), '/chatbot'),
      _Feature('知识库', Icons.menu_book, Color(0xFF02C39A), '/knowledge'),
      _Feature('检测工具', Icons.build, Color(0xFFFF9500), '/tools'),
      _Feature('联系专家', Icons.phone, Color(0xFF5856D6), '/expert'),
    ];

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.rocket_launch, color: Color(0xFF02C39A)),
                SizedBox(width: 8),
                Text('快速开始', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 4,
              mainAxisSpacing: 16,
              crossAxisSpacing: 8,
              children: features.map((f) => _FeatureItem(feature: f)).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCard() {
    final stats = [
      _Stat('12580+', '累计诊断'),
      _Stat('17', '知识条目'),
      _Stat('92%', '修复成功率'),
      _Stat('8', '专业工程师'),
    ];

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.trending_up, color: Color(0xFFFF9500)),
                SizedBox(width: 8),
                Text('服务数据', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: stats.map((s) => _StatItem(stat: s)).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickIssues() {
    final issues = ['黑屏无信号', '花屏条纹', '显卡过热', '供电故障', '显存报错', '驱动崩溃'];

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.help_outline, color: Color(0xFFFF3B30)),
                SizedBox(width: 8),
                Text('常见故障', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Spacer(),
                TextButton(onPressed: () {}, child: Text('查看全部 >')),
              ],
            ),
            SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: issues.map((issue) => _IssueChip(label: issue)).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCompanyTip() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0x1002C39A), Color(0x10065A82)],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Color(0xFF02C39A), style: BorderStyle.solid, width: 1),
      ),
      child: Row(
        children: [
          Icon(Icons.lightbulb_outline, color: Color(0xFF02C39A), size: 32),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('完善企业信息，解锁更多服务', style: TextStyle(fontWeight: FontWeight.w600)),
                SizedBox(height: 4),
                Text('提交企业信息后可享受一次免费上门检测服务', style: TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xFF02C39A),
              foregroundColor: Colors.white,
            ),
            child: Text('立即填写'),
          ),
        ],
      ),
    );
  }
}

// === 数据模型 ===
class _Feature {
  final String name;
  final IconData icon;
  final Color color;
  final String route;
  _Feature(this.name, this.icon, this.color, this.route);
}

class _Stat {
  final String number;
  final String label;
  _Stat(this.number, this.label);
}

// === 组件 ===
class _FeatureItem extends StatelessWidget {
  final _Feature feature;
  const _FeatureItem({required this.feature});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [feature.color, feature.color.withOpacity(0.8)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(feature.icon, color: Colors.white, size: 28),
        ),
        SizedBox(height: 8),
        Text(feature.name, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
      ],
    );
  }
}

class _StatItem extends StatelessWidget {
  final _Stat stat;
  const _StatItem({required this.stat});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(stat.number, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF065A82))),
        SizedBox(height: 4),
        Text(stat.label, style: TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }
}

class _IssueChip extends StatelessWidget {
  final String label;
  const _IssueChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(label),
      backgroundColor: Color(0xFFF5F7FA),
      side: BorderSide.none,
      padding: EdgeInsets.symmetric(horizontal: 8),
    );
  }
}

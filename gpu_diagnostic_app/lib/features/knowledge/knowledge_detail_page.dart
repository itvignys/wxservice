import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';
import '../../core/models/gpu_knowledge.dart';

/// 知识库详情页
class KnowledgeDetailPage extends StatelessWidget {
  final GpuKnowledge item;

  const KnowledgeDetailPage({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    final categoryColor = AppConstants.categoryColors[item.category] ?? const Color(0xFF065A82);

    return Scaffold(
      appBar: AppBar(title: const Text('故障详情')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 分类标签
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: categoryColor,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                item.category,
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500),
              ),
            ),
            const SizedBox(height: 12),
            // 问题标题
            Text(
              item.question,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF333333)),
            ),
            const SizedBox(height: 20),
            // 统计卡片
            Row(
              children: [
                _buildStatCard('维修难度', item.difficulty, categoryColor),
                const SizedBox(width: 12),
                _buildStatCard('维修成本', item.cost, categoryColor),
                const SizedBox(width: 12),
                _buildStatCard('成功率', item.successRate, const Color(0xFF34C759)),
              ],
            ),
            const SizedBox(height: 24),
            // 常见原因
            _buildSection(
              icon: '⚠️',
              title: '常见原因',
              content: item.causes,
            ),
            const SizedBox(height: 16),
            // 排查方法
            _buildSection(
              icon: '🔍',
              title: '排查方法',
              content: item.diagnosis,
            ),
            const SizedBox(height: 16),
            // 维修方案
            _buildSection(
              icon: '🛠️',
              title: '维修方案',
              content: item.solution,
            ),
            const SizedBox(height: 24),
            // 底部操作按钮
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      // 跳转 AI 诊断
                      Navigator.pop(context);
                    },
                    icon: const Text('🤖', style: TextStyle(fontSize: 18)),
                    label: const Text('AI诊断'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      side: const BorderSide(color: Color(0xFF065A82)),
                      foregroundColor: const Color(0xFF065A82),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // 咨询专家
                    },
                    icon: const Text('👨‍🔧', style: TextStyle(fontSize: 18)),
                    label: const Text('咨询专家'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF065A82),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 4),
            Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({required String icon, required String title, required String content}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEEEEEE)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 20)),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF065A82))),
            ],
          ),
          const SizedBox(height: 12),
          Text(content, style: const TextStyle(fontSize: 14, color: Color(0xFF555555), height: 1.6)),
        ],
      ),
    );
  }
}

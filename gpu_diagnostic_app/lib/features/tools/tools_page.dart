import 'package:flutter/material.dart';
import 'tool_detail_page.dart';

/// 工具页面
class ToolsPage extends StatelessWidget {
  const ToolsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final tools = [
      {'name': 'GPU-Z', 'desc': '显卡信息检测与监控', 'icon': Icons.memory, 'color': const Color(0xFF065A82)},
      {'name': 'FurMark', 'desc': '显卡稳定性压力测试', 'icon': Icons.local_fire_department, 'color': const Color(0xFFFF9500)},
      {'name': 'MATS', 'desc': '显存颗粒专业测试（专业版）', 'icon': Icons.science, 'color': const Color(0xFF5856D6)},
      {'name': 'OCCT', 'desc': '系统稳定性综合测试', 'icon': Icons.speed, 'color': const Color(0xFF02C39A)},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('检测工具')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSectionTitle('常用工具'),
          const SizedBox(height: 12),
          ...tools.map((tool) => _buildToolCard(
            context: context,
            name: tool['name'] as String,
            desc: tool['desc'] as String,
            icon: tool['icon'] as IconData,
            color: tool['color'] as Color,
          )).toList(),
          const SizedBox(height: 24),
          _buildSectionTitle('检测教程'),
          const SizedBox(height: 12),
          _buildTutorialCard(),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildToolCard({
    required BuildContext context,
    required String name,
    required String desc,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ToolDetailPage(
              name: name,
              desc: desc,
              icon: icon,
              color: color,
            ),
          ),
        ),
        borderRadius: BorderRadius.circular(16),
        child: ListTile(
          leading: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color),
          ),
          title: Text(name),
          subtitle: Text(desc),
          trailing: Icon(Icons.chevron_right, color: Colors.grey[400]),
        ),
      ),
    );
  }

  Widget _buildTutorialCard() {
    return Card(
      child: ExpansionTile(
        leading: const Icon(Icons.play_circle_outline, color: Color(0xFF065A82)),
        title: const Text('GPU故障自检四步法'),
        subtitle: const Text('点击展开查看详细教程'),
        children: [
          ListTile(
            leading: const CircleAvatar(child: Text('1')),
            title: const Text('外观检查'),
            subtitle: const Text('检查显卡金手指、接口、PCB是否有明显损伤'),
          ),
          ListTile(
            leading: const CircleAvatar(child: Text('2')),
            title: const Text('供电检查'),
            subtitle: const Text('确认供电线连接牢固，电源功率充足'),
          ),
          ListTile(
            leading: const CircleAvatar(child: Text('3')),
            title: const Text('软件检测'),
            subtitle: const Text('使用GPU-Z查看显卡参数是否正常识别'),
          ),
          ListTile(
            leading: const CircleAvatar(child: Text('4')),
            title: const Text('压力测试'),
            subtitle: const Text('运行FurMark进行稳定性测试'),
          ),
        ],
      ),
    );
  }
}

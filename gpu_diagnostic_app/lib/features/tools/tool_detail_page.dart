import 'package:flutter/material.dart';

/// 检测工具详情页
class ToolDetailPage extends StatelessWidget {
  final String name;
  final String desc;
  final IconData icon;
  final Color color;

  const ToolDetailPage({
    super.key,
    required this.name,
    required this.desc,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(name),
        backgroundColor: color,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 24),
            _buildInfoSection('工具简介', _getToolIntro(name)),
            const SizedBox(height: 16),
            _buildInfoSection('使用方法', _getToolUsage(name)),
            const SizedBox(height: 16),
            _buildInfoSection('注意事项', _getToolTips(name)),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.download),
                label: const Text('下载工具'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: color,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: Colors.white, size: 32),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(desc, style: const TextStyle(fontSize: 14, color: Color(0xFF666666))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection(String title, String content) {
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
          Text(title, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 8),
          Text(content, style: const TextStyle(fontSize: 14, color: Color(0xFF555555), height: 1.6)),
        ],
      ),
    );
  }

  String _getToolIntro(String toolName) {
    switch (toolName) {
      case 'GPU-Z':
        return 'GPU-Z 是一款轻量级的显卡信息检测工具，可以快速查看显卡型号、核心频率、显存容量、温度等关键参数。是诊断显卡硬件问题的首选工具。';
      case 'FurMark':
        return 'FurMark 是一款专业的显卡压力测试软件，通过渲染复杂的毛发效果来测试显卡的稳定性和散热性能。可用于检测显卡是否存在虚焊、过热等问题。';
      case 'MATS':
        return 'MATS（Memory Autonomous Test System）是一款专业的显存颗粒测试工具，可以精准定位显存故障。需要专业设备配合，建议由技术人员操作。';
      case 'OCCT':
        return 'OCCT（OverClock Checking Tool）是一款全面的系统稳定性测试工具，可以对CPU、GPU、内存和电源进行综合压力测试，帮助排查系统性故障。';
      default:
        return '专业的显卡检测与维修辅助工具。';
    }
  }

  String _getToolUsage(String toolName) {
    switch (toolName) {
      case 'GPU-Z':
        return '1. 下载并安装 GPU-Z\n2. 打开软件即可自动识别显卡信息\n3. 查看「传感器」标签监控温度、频率\n4. 对比标准参数判断是否异常';
      case 'FurMark':
        return '1. 关闭其他占用显卡的程序\n2. 打开 FurMark，选择合适的分辨率\n3. 点击「GPU Stress Test」开始测试\n4. 观察温度变化和是否有花屏、黑屏现象';
      case 'MATS':
        return '1. 在 DOS 环境下启动 MATS\n2. 选择对应的显卡核心型号\n3. 运行显存颗粒扫描测试\n4. 根据报错信息定位故障显存位置';
      case 'OCCT':
        return '1. 安装 OCCT 并运行\n2. 选择「3D」测试项针对显卡\n3. 设置测试时长（建议15分钟以上）\n4. 监控温度曲线和错误日志';
      default:
        return '请按照官方文档进行操作。';
    }
  }

  String _getToolTips(String toolName) {
    switch (toolName) {
      case 'GPU-Z':
        return '• 注意区分显卡 BIOS 版本是否被修改\n• 温度超过 85°C 需要警惕散热问题\n• 核心频率异常波动可能是供电不稳定';
      case 'FurMark':
        return '• 测试前确保显卡散热系统正常工作\n• 温度超过 90°C 应立即停止测试\n• 出现花屏或驱动重置说明显卡存在硬件故障';
      case 'MATS':
        return '• 操作需要专业焊接设备支持\n• 显存更换对焊接技术要求极高\n• 建议由经验丰富的维修工程师操作';
      case 'OCCT':
        return '• 测试时建议关闭电源节能模式\n• 若电源功率不足会导致测试失败\n• 综合测试可排查主板 PCIe 供电问题';
      default:
        return '• 请在专业人员指导下使用\n• 测试前备份重要数据';
    }
  }
}

import 'package:flutter/material.dart';

/// 快捷症状标签栏（对应小程序 quick-tags）
class QuickSymptomsBar extends StatelessWidget {
  final Function(String) onTap;

  const QuickSymptomsBar({super.key, required this.onTap});

  static const List<String> _symptoms = [
    '显卡黑屏无信号',
    '屏幕花屏有条纹',
    '显卡温度过高',
    '驱动安装失败',
    '显存报错代码',
    'GPU风扇噪音大',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '快速选择常见症状：',
            style: TextStyle(fontSize: 13, color: Colors.grey),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 10,
            runSpacing: 8,
            children: _symptoms.map((symptom) {
              return ActionChip(
                label: Text(symptom),
                backgroundColor: const Color(0xFFF0F7FF),
                side: const BorderSide(color: Color(0xFFD0E3FF)),
                labelStyle: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF065A82),
                ),
                onPressed: () => onTap(symptom),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

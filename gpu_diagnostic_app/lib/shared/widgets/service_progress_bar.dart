import 'package:flutter/material.dart';

/// 服务等级进度条（对应小程序 service-progress）
class ServiceProgressBar extends StatelessWidget {
  final int serviceLevel;

  const ServiceProgressBar({super.key, required this.serviceLevel});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      color: Colors.white,
      child: Row(
        children: [
          _buildStep('1', 'AI诊断', serviceLevel >= 0),
          _buildLine(serviceLevel >= 1),
          _buildStep('2', '专家咨询', serviceLevel >= 1),
          _buildLine(serviceLevel >= 2),
          _buildStep('3', '上门服务', serviceLevel >= 2),
        ],
      ),
    );
  }

  Widget _buildStep(String number, String label, bool isActive) {
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: isActive ? const Color(0xFF065A82) : const Color(0xFFE0E0E0),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                number,
                style: TextStyle(
                  color: isActive ? Colors.white : const Color(0xFF999999),
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isActive ? const Color(0xFF065A82) : const Color(0xFF999999),
              fontWeight: isActive ? FontWeight.w500 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLine(bool isActive) {
    return Expanded(
      child: Container(
        height: 2,
        margin: const EdgeInsets.only(bottom: 24),
        color: isActive ? const Color(0xFF065A82) : const Color(0xFFE0E0E0),
      ),
    );
  }
}

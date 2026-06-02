import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_constants.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';
import '../../core/storage/local_storage.dart';
import '../../providers/auth_provider.dart';

/// 企业认证表单页面
class ServicePage extends ConsumerStatefulWidget {
  const ServicePage({super.key});

  @override
  ConsumerState<ServicePage> createState() => _ServicePageState();
}

class _ServicePageState extends ConsumerState<ServicePage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _creditCodeController = TextEditingController();
  final _contactController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _remarkController = TextEditingController();

  int _gpuCountIndex = 0;
  final List<String> _gpuCountOptions = [
    '1-10张', '11-50张', '51-100张', '100张以上'
  ];

  final List<Map<String, dynamic>> _serviceOptions = [
    {'name': '显卡维修', 'value': 'repair', 'checked': false},
    {'name': '上门检测', 'value': 'inspect', 'checked': false},
    {'name': '批量维保', 'value': 'maintain', 'checked': false},
    {'name': '技术咨询', 'value': 'consult', 'checked': false},
  ];

  bool _agreed = false;
  bool _isSubmitting = false;
  bool _isEdit = false;

  @override
  void initState() {
    super.initState();
    _loadLocalData();
  }

  void _loadLocalData() {
    final json = LocalStorage.getString(AppConstants.storageCompanyInfo);
    if (json != null && json.isNotEmpty) {
      // 简单解析，实际应使用 fromJson
      setState(() => _isEdit = true);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreed) {
      _showSnackBar('请先同意服务协议和隐私政策');
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final services = _serviceOptions
          .where((e) => e['checked'] == true)
          .map((e) => e['value'])
          .toList();

      final data = {
        'name': _nameController.text.trim(),
        'creditCode': _creditCodeController.text.trim(),
        'contact': _contactController.text.trim(),
        'phone': _phoneController.text.trim(),
        'address': _addressController.text.trim(),
        'gpuCount': _gpuCountOptions[_gpuCountIndex],
        'services': services,
        'remark': _remarkController.text.trim(),
      };

      final response = await ApiClient.post(
        ApiConstants.companySave,
        data: data,
      );

      if (response.code == 0) {
        await LocalStorage.setString(AppConstants.storageCompanyInfo, data.toString());
        if (mounted) {
          _showSnackBar(_isEdit ? '更新成功' : '提交成功');
          Navigator.pop(context);
        }
      } else {
        _showSnackBar(response.message);
      }
    } catch (e) {
      _showSnackBar('提交失败: $e');
    } finally {
      setState(() => _isSubmitting = false);
    }
  }

  void _showSnackBar(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('企业服务认证')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 顶部说明
              _buildHeaderCard(),
              const SizedBox(height: 16),
              // 权益说明
              _buildBenefitCard(),
              const SizedBox(height: 16),
              // 表单
              _buildFormCard(),
              const SizedBox(height: 16),
              // 协议
              _buildAgreement(),
              const SizedBox(height: 16),
              // 提交按钮
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF065A82),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(_isEdit ? '更新信息' : '提交认证'),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF065A82),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const Text('🏢', style: TextStyle(fontSize: 40)),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('企业服务认证', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('完善企业信息，解锁免费上门检测服务', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBenefitCard() {
    final benefits = [
      '免费一次上门检测服务（价值¥500）',
      '专属客户经理一对一服务',
      '优先响应，2小时极速上门',
      '维修费用9折优惠',
    ];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('🎁 企业认证权益', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...benefits.map((text) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: Color(0xFF02C39A), size: 18),
                  const SizedBox(width: 8),
                  Expanded(child: Text(text, style: const TextStyle(fontSize: 14, color: Color(0xFF333333)))),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildFormCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('企业信息', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            const Text('请填写真实信息，我们将严格保密', style: TextStyle(fontSize: 12, color: Color(0xFF999999))),
            const SizedBox(height: 16),
            _buildTextField(_nameController, '企业名称', '请输入营业执照上的企业全称', required: true),
            _buildTextField(_creditCodeController, '统一社会信用代码', '请输入18位统一社会信用代码', required: true, maxLength: 18),
            _buildTextField(_contactController, '联系人姓名', '请输入联系人姓名', required: true),
            _buildTextField(_phoneController, '联系电话', '请输入11位手机号码', required: true, keyboardType: TextInputType.phone, maxLength: 11),
            _buildTextField(_addressController, '企业地址', '请输入详细地址（省市区+街道门牌号）', required: true, maxLines: 2),
            // 显卡数量
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('预估显卡数量'),
              trailing: DropdownButton<int>(
                value: _gpuCountIndex,
                underline: const SizedBox(),
                items: List.generate(_gpuCountOptions.length, (i) => DropdownMenuItem(
                  value: i,
                  child: Text(_gpuCountOptions[i]),
                )),
                onChanged: (v) => setState(() => _gpuCountIndex = v ?? 0),
              ),
            ),
            // 服务需求
            const Text('服务需求', style: TextStyle(fontSize: 14)),
            Wrap(
              spacing: 8,
              children: _serviceOptions.map((item) => FilterChip(
                label: Text(item['name']),
                selected: item['checked'],
                onSelected: (selected) => setState(() => item['checked'] = selected),
                selectedColor: const Color(0xFF065A82).withOpacity(0.1),
                checkmarkColor: const Color(0xFF065A82),
              )).toList(),
            ),
            const SizedBox(height: 12),
            _buildTextField(_remarkController, '备注说明', '请描述您的具体需求或问题（选填）', maxLines: 3),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    String hint, {
    bool required = false,
    TextInputType? keyboardType,
    int? maxLength,
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        maxLength: maxLength,
        maxLines: maxLines,
        validator: required
            ? (v) => v == null || v.trim().isEmpty ? '$label不能为空' : null
            : null,
        decoration: InputDecoration(
          labelText: required ? '$label *' : label,
          hintText: hint,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          counterText: '',
        ),
      ),
    );
  }

  Widget _buildAgreement() {
    return Row(
      children: [
        Checkbox(
          value: _agreed,
          onChanged: (v) => setState(() => _agreed = v ?? false),
          activeColor: const Color(0xFF065A82),
        ),
        Expanded(
          child: Wrap(
            children: [
              const Text('我已阅读并同意', style: TextStyle(fontSize: 13)),
              GestureDetector(
                onTap: () {},
                child: const Text('《服务协议》', style: TextStyle(fontSize: 13, color: Color(0xFF065A82))),
              ),
              const Text('和', style: TextStyle(fontSize: 13)),
              GestureDetector(
                onTap: () {},
                child: const Text('《隐私政策》', style: TextStyle(fontSize: 13, color: Color(0xFF065A82))),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

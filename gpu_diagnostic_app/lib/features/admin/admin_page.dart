import 'package:flutter/material.dart';
import '../../core/constants/api_constants.dart';
import '../../core/network/api_client.dart';

/// 管理后台页面
class AdminPage extends StatefulWidget {
  const AdminPage({super.key});

  @override
  State<AdminPage> createState() => _AdminPageState();
}

class _AdminPageState extends State<AdminPage> {
  bool _isLoading = true;
  bool _isDistilling = false;
  Map<String, dynamic> _stats = {};
  Map<String, dynamic> _satisfaction = {};
  List<dynamic> _topQuestions = [];
  List<dynamic> _dailyStats = [];
  List<dynamic> _pendingList = [];
  List<dynamic> _historyList = [];
  String _searchKeyword = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      // 并行加载统计数据和待确认列表
      final statsRes = await ApiClient.get(ApiConstants.aiStats);
      final pendingRes = await ApiClient.get(ApiConstants.adminPendingKnowledge);

      if (statsRes.code == 0 && statsRes.data != null) {
        final data = statsRes.data as Map<String, dynamic>;
        setState(() {
          _stats = data;
          _satisfaction = data['satisfaction'] ?? {};
          _topQuestions = data['topQuestions'] ?? [];
          _dailyStats = data['dailyStats'] ?? [];
        });
      }

      if (pendingRes.code == 0 && pendingRes.data != null) {
        setState(() => _pendingList = pendingRes.data['list'] ?? []);
      }
    } catch (e) {
      debugPrint('加载管理后台数据失败: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _triggerDistill() async {
    setState(() => _isDistilling = true);
    try {
      final response = await ApiClient.post(ApiConstants.adminTriggerDistill);
      if (response.code == 0) {
        _showSnackBar('知识提纯任务已触发');
        await _loadData();
      } else {
        _showSnackBar(response.message);
      }
    } catch (e) {
      _showSnackBar('触发失败: $e');
    } finally {
      setState(() => _isDistilling = false);
    }
  }

  Future<void> _confirmKnowledge(int id) async {
    try {
      final response = await ApiClient.post(
        '${ApiConstants.adminConfirmKnowledge}/$id',
      );
      if (response.code == 0) {
        _showSnackBar('已确认入库');
        await _loadData();
      } else {
        _showSnackBar(response.message);
      }
    } catch (e) {
      _showSnackBar('操作失败: $e');
    }
  }

  Future<void> _searchHistory() async {
    if (_searchKeyword.trim().isEmpty) return;
    try {
      final response = await ApiClient.get(
        ApiConstants.aiSearch,
        queryParameters: {'keyword': _searchKeyword, 'source': 'history'},
      );
      if (response.code == 0) {
        setState(() => _historyList = response.data ?? []);
      }
    } catch (e) {
      debugPrint('搜索失败: $e');
    }
  }

  void _showSnackBar(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('知识运营管理')),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 统计卡片
              _buildStatsSection(),
              const SizedBox(height: 16),
              // 满意度
              _buildSatisfactionCard(),
              const SizedBox(height: 16),
              // 热门问题
              if (_topQuestions.isNotEmpty) _buildTopQuestionsCard(),
              if (_topQuestions.isNotEmpty) const SizedBox(height: 16),
              // 操作按钮
              _buildActionButton(),
              const SizedBox(height: 16),
              // 搜索
              _buildSearchBox(),
              const SizedBox(height: 16),
              // 历史检索结果
              if (_historyList.isNotEmpty) _buildHistoryList(),
              if (_historyList.isNotEmpty) const SizedBox(height: 16),
              // 待确认列表
              _buildPendingSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsSection() {
    final items = [
      {'label': '优质数据资产', 'value': '${_stats['valuableCount'] ?? 0}', 'color': const Color(0xFF065A82)},
      {'label': '总对话量', 'value': '${_stats['totalCount'] ?? 0}', 'color': const Color(0xFF34C759)},
      {'label': '待确认草稿', 'value': '${_stats['pendingCount'] ?? 0}', 'color': const Color(0xFFFF9500)},
    ];
    return Row(
      children: items.map((item) => Expanded(
        child: Card(
          color: (item['color'] as Color).withOpacity(0.1),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Column(
              children: [
                Text(
                  item['value'] as String,
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: item['color'] as Color),
                ),
                const SizedBox(height: 4),
                Text(item['label'] as String, style: TextStyle(fontSize: 12, color: (item['color'] as Color).withOpacity(0.8))),
              ],
            ),
          ),
        ),
      )).toList(),
    );
  }

  Widget _buildSatisfactionCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('用户满意度', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildSatisfactionItem('👍', '有用', _satisfaction['like'] ?? 0, const Color(0xFF34C759)),
                ),
                Expanded(
                  child: _buildSatisfactionItem('👎', '没用', _satisfaction['dislike'] ?? 0, const Color(0xFFFF3B30)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSatisfactionItem(String emoji, String label, int count, Color color) {
    return Column(
      children: [
        Text(emoji, style: const TextStyle(fontSize: 28)),
        Text('$count', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
      ],
    );
  }

  Widget _buildTopQuestionsCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('🔥 热门问题 TOP10（近7天）', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...List.generate(_topQuestions.length > 10 ? 10 : _topQuestions.length, (i) {
              final item = _topQuestions[i] as Map<String, dynamic>;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  children: [
                    Container(
                      width: 22, height: 22,
                      decoration: BoxDecoration(
                        color: i < 3 ? const Color(0xFFFF9500) : const Color(0xFF999999),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      alignment: Alignment.center,
                      child: Text('${i + 1}', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 8),
                    Expanded(child: Text('${item['question']}', style: const TextStyle(fontSize: 13), overflow: TextOverflow.ellipsis)),
                    Text('${item['count']}次', style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: _isDistilling ? null : _triggerDistill,
        icon: _isDistilling
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : const Icon(Icons.refresh),
        label: Text(_isDistilling ? '正在提纯...' : '手动触发知识提纯'),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF065A82),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }

  Widget _buildSearchBox() {
    return TextField(
      decoration: InputDecoration(
        hintText: '检索历史优质问答...',
        prefixIcon: const Icon(Icons.search),
        suffixIcon: _searchKeyword.isNotEmpty
            ? IconButton(
                icon: const Icon(Icons.clear),
                onPressed: () {
                  setState(() {
                    _searchKeyword = '';
                    _historyList = [];
                  });
                },
              )
            : null,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: Colors.white,
      ),
      onChanged: (v) => setState(() => _searchKeyword = v),
      onSubmitted: (_) => _searchHistory(),
    );
  }

  Widget _buildHistoryList() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('检索结果（${_historyList.length}条）', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ..._historyList.map((item) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F7FA),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Q：${item['question']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('A：${item['answer']}', style: const TextStyle(fontSize: 13, color: Color(0xFF666666))),
                ],
              ),
            )).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildPendingSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('待确认知识条目', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            Text('${_pendingList.length} 条', style: const TextStyle(fontSize: 14, color: Color(0xFF999999))),
          ],
        ),
        const SizedBox(height: 12),
        if (_isLoading)
          const Center(child: CircularProgressIndicator())
        else if (_pendingList.isEmpty)
          _buildEmptyState()
        else
          ..._pendingList.map((item) => _buildPendingCard(item as Map<String, dynamic>)).toList(),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(32),
      alignment: Alignment.center,
      child: const Column(
        children: [
          Text('📭', style: TextStyle(fontSize: 48)),
          SizedBox(height: 12),
          Text('暂无待确认草稿', style: TextStyle(fontSize: 16, color: Color(0xFF999999))),
          SizedBox(height: 4),
          Text('优质对话被用户点赞后，可点击上方"手动触发知识提纯"生成', style: TextStyle(fontSize: 12, color: Color(0xFFCCCCCC)), textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildPendingCard(Map<String, dynamic> item) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF065A82),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text('${item['category'] ?? '其他'}', style: const TextStyle(color: Colors.white, fontSize: 12)),
                ),
                const Spacer(),
                Text('#${item['id']}', style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
              ],
            ),
            const SizedBox(height: 8),
            Text('${item['question']}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('原因：${item['causes']}', style: const TextStyle(fontSize: 13, color: Color(0xFF666666)), maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 4),
            Text('方案：${item['solution']}', style: const TextStyle(fontSize: 13, color: Color(0xFF666666)), maxLines: 2, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 12),
            Row(
              children: [
                Text('难度：${item['difficulty']}', style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
                const SizedBox(width: 12),
                Text('成本：${item['cost']}', style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
                const SizedBox(width: 12),
                Text('成功率：${item['successRate']}', style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                OutlinedButton(
                  onPressed: () => _showDetailDialog(item),
                  child: const Text('查看详情'),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _confirmKnowledge(item['id']),
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF02C39A), foregroundColor: Colors.white),
                    child: const Text('确认入库'),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.delete_outline, color: Color(0xFFFF3B30)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showDetailDialog(Map<String, dynamic> item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (_, scrollController) => SingleChildScrollView(
          controller: scrollController,
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFF065A82), borderRadius: BorderRadius.circular(4)),
                child: Text('${item['category'] ?? '其他'}', style: const TextStyle(color: Colors.white, fontSize: 12)),
              ),
              const SizedBox(height: 12),
              Text('${item['question']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              _buildDetailBlock('常见原因', '${item['causes']}'),
              _buildDetailBlock('排查方法', '${item['diagnosis']}'),
              _buildDetailBlock('维修方案', '${item['solution']}'),
              _buildDetailBlock('难度评估', '${item['difficulty']}'),
              _buildDetailBlock('维修成本', '${item['cost']}'),
              _buildDetailBlock('成功率', '${item['successRate']}'),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _confirmKnowledge(item['id']);
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF02C39A), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14)),
                  child: const Text('确认入库'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailBlock(String label, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF065A82))),
          const SizedBox(height: 4),
          Text(content, style: const TextStyle(fontSize: 14, color: Color(0xFF333333))),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';
import '../../core/constants/app_constants.dart';
import '../../core/models/gpu_knowledge.dart';
import '../../providers/knowledge_provider.dart';
import 'knowledge_detail_page.dart';

/// 知识库页面
class KnowledgePage extends ConsumerStatefulWidget {
  const KnowledgePage({super.key});

  @override
  ConsumerState<KnowledgePage> createState() => _KnowledgePageState();
}

class _KnowledgePageState extends ConsumerState<KnowledgePage> {
  final RefreshController _refreshController = RefreshController(initialRefresh: false);

  @override
  void dispose() {
    _refreshController.dispose();
    super.dispose();
  }

  Future<void> _onRefresh() async {
    await ref.read(knowledgeProvider.notifier).loadData();
    _refreshController.refreshCompleted();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(knowledgeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('知识库'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              decoration: InputDecoration(
                hintText: '搜索故障关键词...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(28),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
              onChanged: (value) {
                ref.read(knowledgeProvider.notifier).updateSearchKeyword(value);
              },
              onSubmitted: (value) {
                ref.read(knowledgeProvider.notifier).performSearch();
              },
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // 分类标签栏
          SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: state.categories.length + 1,
              itemBuilder: (context, index) {
                final category = index == 0 ? '全部' : state.categories[index - 1];
                final isSelected = state.currentCategory == category;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                  child: ChoiceChip(
                    label: Text(category),
                    selected: isSelected,
                    onSelected: (_) {
                      ref.read(knowledgeProvider.notifier).selectCategory(category);
                    },
                    selectedColor: const Color(0xFF065A82),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : Colors.black87,
                      fontSize: 13,
                    ),
                  ),
                );
              },
            ),
          ),

          // 列表内容
          Expanded(
            child: state.isLoading && state.list.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : SmartRefresher(
                    controller: _refreshController,
                    onRefresh: _onRefresh,
                    header: const ClassicHeader(
                      refreshingText: '加载中...',
                      completeText: '刷新完成',
                      failedText: '刷新失败',
                      idleText: '下拉刷新',
                      releaseText: '释放刷新',
                    ),
                    child: state.list.isEmpty
                        ? ListView(
                            children: const [
                              SizedBox(height: 100),
                              Center(child: Text('暂无数据', style: TextStyle(color: Colors.grey))),
                            ],
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: state.list.length,
                            itemBuilder: (context, index) {
                              final item = state.list[index];
                              return _KnowledgeCard(
                                item: item,
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => KnowledgeDetailPage(item: item),
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _KnowledgeCard extends StatelessWidget {
  final GpuKnowledge item;
  final VoidCallback onTap;

  const _KnowledgeCard({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final categoryColor = AppConstants.categoryColors[item.category] ?? const Color(0xFF065A82);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
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
                      color: categoryColor,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      item.category,
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                  const Spacer(),
                  Text('难度：${item.difficulty}', style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                item.question,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              Text(
                '原因：${item.causes}',
                style: const TextStyle(fontSize: 13, color: Color(0xFF666666)),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.build, size: 14, color: Color(0xFF999999)),
                  const SizedBox(width: 4),
                  Text(item.cost, style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
                  const SizedBox(width: 16),
                  const Icon(Icons.bar_chart, size: 14, color: Color(0xFF999999)),
                  const SizedBox(width: 4),
                  Text(item.successRate, style: const TextStyle(fontSize: 12, color: Color(0xFF999999))),
                  const Spacer(),
                  const Icon(Icons.chevron_right, color: Color(0xFFCCCCCC)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models/gpu_knowledge.dart';
import '../core/network/api_client.dart';
import '../constants/api_constants.dart';

/// 知识库状态
class KnowledgeState {
  final List<GpuKnowledge> list;
  final List<String> categories;
  final Map<String, int> categoryStats;
  final String currentCategory;
  final String searchKeyword;
  final bool isLoading;
  final String? error;

  KnowledgeState({
    this.list = const [],
    this.categories = const [],
    this.categoryStats = const {},
    this.currentCategory = '全部',
    this.searchKeyword = '',
    this.isLoading = false,
    this.error,
  });

  KnowledgeState copyWith({
    List<GpuKnowledge>? list,
    List<String>? categories,
    Map<String, int>? categoryStats,
    String? currentCategory,
    String? searchKeyword,
    bool? isLoading,
    String? error,
  }) {
    return KnowledgeState(
      list: list ?? this.list,
      categories: categories ?? this.categories,
      categoryStats: categoryStats ?? this.categoryStats,
      currentCategory: currentCategory ?? this.currentCategory,
      searchKeyword: searchKeyword ?? this.searchKeyword,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// 知识库状态管理器
class KnowledgeNotifier extends StateNotifier<KnowledgeState> {
  KnowledgeNotifier() : super(KnowledgeState()) {
    loadData();
  }

  Future<void> loadData() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      // TODO: 并行调用 API
      // final categoryRes = await ApiClient.get(ApiConstants.knowledgeCategories);
      // final listRes = await ApiClient.get(ApiConstants.knowledgeList);
      await Future.delayed(const Duration(milliseconds: 500));

      state = state.copyWith(
        isLoading: false,
        categories: ['显示类', '驱动类', '供电与过热', '物理与接口', '显存与核心', 'BIOS与固件'],
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void selectCategory(String category) {
    state = state.copyWith(currentCategory: category);
    performSearch();
  }

  void updateSearchKeyword(String keyword) {
    state = state.copyWith(searchKeyword: keyword);
  }

  Future<void> performSearch() async {
    // TODO: 调用 ApiClient.get(ApiConstants.knowledgeSearch, ...)
  }
}

/// 全局 Knowledge Provider
final knowledgeProvider = StateNotifierProvider<KnowledgeNotifier, KnowledgeState>((ref) {
  return KnowledgeNotifier();
});

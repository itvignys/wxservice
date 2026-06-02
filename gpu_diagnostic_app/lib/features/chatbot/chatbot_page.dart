import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/chat_provider.dart';
import '../../shared/widgets/service_progress_bar.dart';
import '../../shared/widgets/chat_bubble.dart';
import '../../shared/widgets/quick_symptoms_bar.dart';
import '../../shared/widgets/chat_input_area.dart';

/// AI 检测页面（核心交互页面）
class ChatbotPage extends ConsumerStatefulWidget {
  const ChatbotPage({super.key});

  @override
  ConsumerState<ChatbotPage> createState() => _ChatbotPageState();
}

class _ChatbotPageState extends ConsumerState<ChatbotPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);
    final chatNotifier = ref.read(chatProvider.notifier);

    // 消息变化时自动滚动到底部
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Scaffold(
      appBar: AppBar(
        title: const Text('智能检测'),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // 服务等级进度条
          const ServiceProgressBar(serviceLevel: 0),

          // 消息列表
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: chatState.messages.length,
              itemBuilder: (context, index) {
                final msg = chatState.messages[index];
                return ChatBubble(message: msg);
              },
            ),
          ),

          // 快捷症状标签
          QuickSymptomsBar(
            onTap: (text) => chatNotifier.sendQuickMessage(text),
          ),

          // 输入区域
          ChatInputArea(
            isLoading: chatState.isLoading,
            onSend: (text) => chatNotifier.sendMessage(text),
            onImagePick: (path) => chatNotifier.sendImage(path),
          ),
        ],
      ),
    );
  }
}

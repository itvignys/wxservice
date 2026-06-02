import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/api_constants.dart';
import '../core/models/chat_message.dart';
import '../core/network/api_client.dart';

/// 聊天消息列表状态
class ChatState {
  final List<ChatMessage> messages;
  final bool isLoading;
  final String inputText;
  final int serviceLevel;
  final String sessionId;

  ChatState({
    this.messages = const [],
    this.isLoading = false,
    this.inputText = '',
    this.serviceLevel = 0,
    this.sessionId = '',
  });

  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    String? inputText,
    int? serviceLevel,
    String? sessionId,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      inputText: inputText ?? this.inputText,
      serviceLevel: serviceLevel ?? this.serviceLevel,
      sessionId: sessionId ?? this.sessionId,
    );
  }
}

/// 聊天状态管理器
class ChatNotifier extends StateNotifier<ChatState> {
  ChatNotifier() : super(ChatState()) {
    _initWelcomeMessage();
  }

  void _initWelcomeMessage() {
    final welcome = ChatMessage.aiText(
      '您好！我是GPU智修专家助手。请描述您的显卡故障现象，或上传故障图片，我将为您进行初步诊断。',
    );
    state = state.copyWith(
      messages: [welcome],
      sessionId: _generateSessionId(),
    );
  }

  String _generateSessionId() {
    return 'sess_${DateTime.now().millisecondsSinceEpoch}_${(100000 + DateTime.now().microsecond)}';
  }

  void updateInput(String text) {
    state = state.copyWith(inputText: text);
  }

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMsg = ChatMessage.userText(text);
    state = state.copyWith(
      messages: [...state.messages, userMsg],
      inputText: '',
      isLoading: true,
    );

    try {
      final context = _getChatContext();
      final response = await ApiClient.post<Map<String, dynamic>>(
        ApiConstants.aiChat,
        data: {
          'message': text,
          'context': context,
          'scene': 'gpu_diagnosis',
          'sessionId': state.sessionId,
        },
        fromJson: (data) => data as Map<String, dynamic>,
      );

      if (response.code == 0 && response.data != null) {
        final reply = response.data!['reply'] ?? 'AI 未返回有效回答';
        final aiMsg = ChatMessage.aiText(reply);
        state = state.copyWith(
          messages: [...state.messages, aiMsg],
          isLoading: false,
        );
      } else {
        final errorMsg = ChatMessage.system(response.message);
        state = state.copyWith(
          messages: [...state.messages, errorMsg],
          isLoading: false,
        );
      }
    } catch (e) {
      final errorMsg = ChatMessage.system('网络异常，请稍后重试');
      state = state.copyWith(
        messages: [...state.messages, errorMsg],
        isLoading: false,
      );
    }
  }

  void sendQuickMessage(String text) {
    sendMessage(text);
  }

  Future<void> sendImage(String imagePath) async {
    final userMsg = ChatMessage.userImage(imagePath);
    state = state.copyWith(
      messages: [...state.messages, userMsg],
      isLoading: true,
    );

    try {
      // 1. 先上传图片
      final uploadRes = await ApiClient.upload<String>(imagePath, fromJson: (data) => data?.toString() ?? '');
      if (uploadRes.code != 0 || uploadRes.data == null) {
        throw Exception(uploadRes.message);
      }
      final imageUrl = uploadRes.data!;

      // 2. 调用 AI 图片诊断接口
      final response = await ApiClient.post<Map<String, dynamic>>(
        ApiConstants.aiChat,
        data: {
          'message': '请分析这张显卡故障图片',
          'imageUrl': imageUrl,
          'scene': 'gpu_diagnosis',
          'sessionId': state.sessionId,
        },
        fromJson: (data) => data as Map<String, dynamic>,
      );

      final reply = (response.code == 0 && response.data != null)
          ? response.data!['reply'] ?? '已收到图片，正在分析中...'
          : '图片分析服务暂时不可用';

      final aiMsg = ChatMessage.aiText(reply);
      state = state.copyWith(
        messages: [...state.messages, aiMsg],
        isLoading: false,
      );
    } catch (e) {
      final errorMsg = ChatMessage.system('图片上传失败，请重试');
      state = state.copyWith(
        messages: [...state.messages, errorMsg],
        isLoading: false,
      );
    }
  }

  /// 获取最近5轮文字对话上下文
  List<Map<String, String>> _getChatContext() {
    final context = <Map<String, String>>[];
    int count = 0;
    for (final msg in state.messages.reversed) {
      if (msg.type == MessageType.user && !msg.isImage) {
        context.insert(0, {'role': 'user', 'content': msg.content});
        count++;
      } else if (msg.type == MessageType.ai && !msg.isImage) {
        context.insert(0, {'role': 'assistant', 'content': msg.content});
        count++;
      }
      if (count >= 10) break; // 5轮 = 10条消息
    }
    return context;
  }
}

/// 全局 Chat Provider
final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier();
});

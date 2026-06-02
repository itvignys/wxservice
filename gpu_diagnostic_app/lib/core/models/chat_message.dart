/// 聊天消息模型
enum MessageType { user, ai, system }

class ChatMessage {
  final String id;
  final MessageType type;
  final String content;
  final String? contentType; // text, image
  final DateTime? createdAt;

  // AI 专属字段
  final bool? isYuanbao;
  final bool? knowledgeMatch;
  final int? matchScore;
  final bool? showUpgrade;
  final String? feedback; // like, dislike

  // 图片
  final String? imageUrl;

  ChatMessage({
    required this.id,
    required this.type,
    required this.content,
    this.contentType = 'text',
    this.createdAt,
    this.isYuanbao,
    this.knowledgeMatch,
    this.matchScore,
    this.showUpgrade,
    this.feedback,
    this.imageUrl,
  });

  factory ChatMessage.userText(String content) {
    return ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: MessageType.user,
      content: content,
    );
  }

  factory ChatMessage.userImage(String imageUrl) {
    return ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: MessageType.user,
      content: imageUrl,
      contentType: 'image',
      imageUrl: imageUrl,
    );
  }

  factory ChatMessage.aiText(String content) {
    return ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: MessageType.ai,
      content: content,
    );
  }

  factory ChatMessage.system(String content) {
    return ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      type: MessageType.system,
      content: content,
    );
  }

  bool get isText => contentType == 'text' || contentType == null;
  bool get isImage => contentType == 'image';
}

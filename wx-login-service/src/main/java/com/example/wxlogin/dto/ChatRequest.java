package com.example.wxlogin.dto;

import lombok.Data;

/**
 * AI对话请求DTO
 */
@Data
public class ChatRequest {
    /** 用户消息 */
    private String message;
    /** 对话上下文 */
    private java.util.List<java.util.Map<String, String>> context;
    /** 业务场景标识 */
    private String scene;
    /** 图片Base64数据（用于图片分析，格式：data:image/jpeg;base64,...） */
    private String imageBase64;
    /** 图片URL（优先使用，上传后获取的可访问地址） */
    private String imageUrl;
    /** 会话ID（用于串联同一轮对话） */
    private String sessionId;
}

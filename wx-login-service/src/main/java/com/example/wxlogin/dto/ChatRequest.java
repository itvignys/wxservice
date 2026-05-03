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
}

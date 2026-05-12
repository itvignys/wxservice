package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI对话记录实体
 * 用于持久化用户与AI的每一次问答，形成可检索、可反馈的数据资产
 */
@Data
@TableName("ai_conversation")
public class AiConversation {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户标识（openid或user_id） */
    private String userId;

    /** 会话ID，用于串联同一轮对话 */
    private String sessionId;

    /** 用户问题 */
    private String question;

    /** AI回答 */
    private String answer;

    /** 图片Base64（含MIME前缀） */
    private String imageBase64;

    /** 回答来源：yuanbao=元宝AI, knowledge=知识库, fallback=兜底 */
    private String source;

    /** 用户反馈：1=有用, 0=无用, NULL=未评价 */
    private Integer isHelpful;

    /** 是否已知识提纯：0=未处理, 1=已处理 */
    private Integer distilled;

    /** AI自动标签（JSON数组字符串） */
    private String tags;

    /** 扩展元数据（JSON字符串）：如匹配的知识库ID、相似度分数等 */
    private String metadata;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

package com.example.wxlogin.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.wxlogin.entity.AiConversation;

import java.util.List;
import java.util.Map;

public interface AiConversationService extends IService<AiConversation> {

    /**
     * 保存一次AI对话记录
     */
    AiConversation saveConversation(String userId, String sessionId,
                                     String question, String answer,
                                     String imageBase64, String source,
                                     String metadata);

    /**
     * 全文检索历史优质问答
     */
    List<AiConversation> searchHistory(String keyword, int limit);

    /**
     * 获取最近会话记录
     */
    List<AiConversation> getRecentSessionHistory(String userId, String sessionId, int limit);

    /**
     * 用户反馈：点赞/点踩
     */
    boolean feedback(Long id, boolean helpful);

    /**
     * 统计优质数据资产数量
     */
    long countValuableAssets();

    /**
     * 按日期统计对话量（近30天）
     */
    List<Map<String, Object>> getDailyConversationStats();

    /**
     * 用户满意度分布
     */
    Map<String, Long> getSatisfactionDistribution();

    /**
     * 热门问题TOP10（近7天）
     */
    List<Map<String, Object>> getTopQuestions();
}

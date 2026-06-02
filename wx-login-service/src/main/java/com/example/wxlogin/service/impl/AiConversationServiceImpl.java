package com.example.wxlogin.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.wxlogin.entity.AiConversation;
import com.example.wxlogin.mapper.AiConversationMapper;
import com.example.wxlogin.service.AiConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiConversationServiceImpl extends ServiceImpl<AiConversationMapper, AiConversation>
        implements AiConversationService {

    private final AiConversationMapper conversationMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AiConversation saveConversation(String userId, String sessionId,
                                            String question, String answer,
                                            String imageBase64, String source,
                                            String metadata) {
        AiConversation conv = new AiConversation();
        conv.setUserId(userId);
        conv.setSessionId(sessionId != null ? sessionId : UUID.randomUUID().toString().replace("-", ""));
        conv.setQuestion(question);
        conv.setAnswer(answer);
        conv.setImageBase64(imageBase64);
        conv.setSource(source);
        conv.setMetadata(metadata);
        // tags 在后续阶段可由AI自动提取
        conversationMapper.insert(conv);
        log.info("AI对话已持久化, id={}, source={}", conv.getId(), source);
        return conv;
    }

    @Override
    public List<AiConversation> searchHistory(String keyword, int limit) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of();
        }
        // 清理关键词，避免注入和布尔模式语法错误
        String clean = keyword.trim().replaceAll("[+\\-<>()@~\"*]", " ");
        if (clean.isEmpty()) {
            return List.of();
        }
        // 构造布尔模式：每个词前加+表示必须包含
        String[] words = clean.split("\\s+");
        StringBuilder bool = new StringBuilder();
        for (String w : words) {
            if (w.length() >= 2) {
                bool.append("+").append(w).append(" ");
            }
        }
        String finalKeyword = bool.toString().trim();
        if (finalKeyword.isEmpty()) {
            return List.of();
        }
        return conversationMapper.fullTextSearch(finalKeyword, limit);
    }

    @Override
    public List<AiConversation> getRecentSessionHistory(String userId, String sessionId, int limit) {
        return conversationMapper.findRecentBySession(userId, sessionId, limit);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean feedback(Long id, boolean helpful) {
        int rows = conversationMapper.updateFeedback(id, helpful ? 1 : 0);
        log.info("用户反馈已更新, id={}, helpful={}, rows={}", id, helpful, rows);
        return rows > 0;
    }

    @Override
    public long countValuableAssets() {
        return conversationMapper.countValuableConversations();
    }

    @Override
    public List<Map<String, Object>> getDailyConversationStats() {
        return conversationMapper.countByDate();
    }

    @Override
    public Map<String, Long> getSatisfactionDistribution() {
        List<Map<String, Object>> list = conversationMapper.countFeedbackDistribution();
        Map<String, Long> result = new HashMap<>();
        result.put("like", 0L);
        result.put("dislike", 0L);
        for (Map<String, Object> item : list) {
            Integer helpful = (Integer) item.get("is_helpful");
            Long count = ((Number) item.get("count")).longValue();
            if (helpful != null && helpful == 1) {
                result.put("like", count);
            } else if (helpful != null && helpful == 0) {
                result.put("dislike", count);
            }
        }
        return result;
    }

    @Override
    public List<Map<String, Object>> getTopQuestions() {
        return conversationMapper.topQuestions();
    }
}

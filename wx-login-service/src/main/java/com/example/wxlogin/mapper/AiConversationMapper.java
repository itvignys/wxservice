package com.example.wxlogin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.wxlogin.entity.AiConversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;
import java.util.Map;

@Mapper
public interface AiConversationMapper extends BaseMapper<AiConversation> {

    /**
     * MySQL全文检索：按关键词搜索历史问答（ngram分词）
     * 使用布尔模式，支持+/-逻辑
     */
    @Select("SELECT * FROM ai_conversation " +
            "WHERE MATCH(question, answer) AGAINST(#{keyword} IN BOOLEAN MODE) " +
            "AND (is_helpful IS NULL OR is_helpful = 1) " +
            "ORDER BY created_at DESC LIMIT #{limit}")
    List<AiConversation> fullTextSearch(@Param("keyword") String keyword, @Param("limit") int limit);

    /**
     * 获取某用户某会话下的最近N条对话
     */
    @Select("SELECT * FROM ai_conversation " +
            "WHERE user_id = #{userId} AND session_id = #{sessionId} " +
            "ORDER BY created_at DESC LIMIT #{limit}")
    List<AiConversation> findRecentBySession(@Param("userId") String userId,
                                              @Param("sessionId") String sessionId,
                                              @Param("limit") int limit);

    /**
     * 更新用户反馈
     */
    @Update("UPDATE ai_conversation SET is_helpful = #{isHelpful}, updated_at = NOW() WHERE id = #{id}")
    int updateFeedback(@Param("id") Long id, @Param("isHelpful") Integer isHelpful);

    /**
     * 统计优质问答数量（is_helpful=1 或 未评价）
     */
    @Select("SELECT COUNT(*) FROM ai_conversation WHERE is_helpful IS NULL OR is_helpful = 1")
    long countValuableConversations();

    /**
     * 按日期统计对话量
     */
    @Select("SELECT DATE(created_at) as date, COUNT(*) as count " +
            "FROM ai_conversation " +
            "WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) " +
            "GROUP BY DATE(created_at) " +
            "ORDER BY date")
    List<Map<String, Object>> countByDate();

    /**
     * 统计用户满意度（is_helpful分布）
     */
    @Select("SELECT is_helpful, COUNT(*) as count FROM ai_conversation " +
            "WHERE is_helpful IS NOT NULL " +
            "GROUP BY is_helpful")
    List<Map<String, Object>> countFeedbackDistribution();

    /**
     * 热门问题TOP10
     */
    @Select("SELECT question, COUNT(*) as count FROM ai_conversation " +
            "WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) " +
            "GROUP BY question " +
            "ORDER BY count DESC " +
            "LIMIT 10")
    List<Map<String, Object>> topQuestions();
}

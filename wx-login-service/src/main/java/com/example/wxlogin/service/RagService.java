package com.example.wxlogin.service;

import com.example.wxlogin.entity.AiConversation;
import com.example.wxlogin.entity.GpuKnowledge;

import java.util.List;

/**
 * RAG（检索增强生成）服务接口
 * 负责从多路数据源召回相关知识，注入Prompt以提升AI回答质量
 *
 * 当前实现：基于MySQL FULLTEXT索引做语义检索
 * 未来扩展：可替换为腾讯云VectorDB向量检索
 */
public interface RagService {

    /**
     * 多路召回：同时检索结构化知识库 + 历史优质对话
     *
     * @param query 用户问题
     * @param topK  每路召回数量
     * @return 拼接好的RAG上下文文本（可直接注入System Prompt）
     */
    String retrieveAndBuildContext(String query, int topK);

    /**
     * 从结构化知识库召回
     */
    List<GpuKnowledge> retrieveFromKnowledgeBase(String query, int limit);

    /**
     * 从历史对话记录召回（仅is_helpful=1或NULL的优质记录）
     */
    List<AiConversation> retrieveFromHistory(String query, int limit);
}

package com.example.wxlogin.service;

import com.example.wxlogin.entity.AiConversation;
import com.example.wxlogin.entity.GpuKnowledge;

import java.util.List;

/**
 * 知识提纯服务
 * 将优质AI对话自动提炼为结构化的 GpuKnowledge 条目
 */
public interface KnowledgeDistillService {

    /**
     * 从单条对话中提纯结构化知识
     *
     * @param conversation AI对话记录
     * @return 结构化知识条目（草稿状态，需人工确认）
     */
    GpuKnowledge distill(AiConversation conversation);

    /**
     * 批量提纯：扫描所有未处理且 is_helpful=1 的对话
     *
     * @param batchSize 每批处理数量
     * @return 本次提纯生成的知识条目列表
     */
    List<GpuKnowledge> batchDistill(int batchSize);

    /**
     * 获取待人工确认的知识条目
     */
    List<GpuKnowledge> getPendingConfirmations();

    /**
     * 管理员确认并入库
     */
    boolean confirmAndSave(Long knowledgeId);
}

package com.example.wxlogin.service.impl;

import com.example.wxlogin.entity.AiConversation;
import com.example.wxlogin.entity.GpuKnowledge;
import com.example.wxlogin.service.AiConversationService;
import com.example.wxlogin.service.KnowledgeService;
import com.example.wxlogin.service.RagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * RAG服务实现
 * 当前基于MySQL FULLTEXT索引实现语义检索
 * 后续可无缝替换为腾讯云VectorDB向量检索
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RagServiceImpl implements RagService {

    private final KnowledgeService knowledgeService;
    private final AiConversationService conversationService;

    @Override
    public String retrieveAndBuildContext(String query, int topK) {
        List<GpuKnowledge> knowledgeList = retrieveFromKnowledgeBase(query, topK);
        List<AiConversation> historyList = retrieveFromHistory(query, topK);

        StringBuilder ctx = new StringBuilder();

        // 1. 结构化知识库
        if (!knowledgeList.isEmpty()) {
            ctx.append("## 已知知识库条目（按相关度排序）\n");
            for (int i = 0; i < knowledgeList.size(); i++) {
                GpuKnowledge k = knowledgeList.get(i);
                ctx.append(i + 1).append(". ").append(k.getQuestion()).append("\n");
                ctx.append("   原因：").append(k.getCauses()).append("\n");
                ctx.append("   排查：").append(k.getDiagnosis()).append("\n");
                ctx.append("   方案：").append(k.getSolution()).append("\n\n");
            }
        }

        // 2. 历史优质问答
        if (!historyList.isEmpty()) {
            ctx.append("## 历史类似问题与解答\n");
            for (int i = 0; i < historyList.size(); i++) {
                AiConversation conv = historyList.get(i);
                ctx.append(i + 1).append(". Q：").append(conv.getQuestion()).append("\n");
                // 答案截断，避免Prompt过长
                String ans = conv.getAnswer();
                if (ans.length() > 300) {
                    ans = ans.substring(0, 300) + "...";
                }
                ctx.append("   A：").append(ans).append("\n\n");
            }
        }

        String result = ctx.toString().trim();
        log.info("RAG检索完成, query={}, knowledge={}, history={}, contextLength={}",
            query, knowledgeList.size(), historyList.size(), result.length());
        return result;
    }

    @Override
    public List<GpuKnowledge> retrieveFromKnowledgeBase(String query, int limit) {
        // 当前使用MySQL LIKE模糊查询，后续可接入全文检索
        List<GpuKnowledge> list = knowledgeService.search(query, null);
        return list.stream().limit(limit).collect(Collectors.toList());
    }

    @Override
    public List<AiConversation> retrieveFromHistory(String query, int limit) {
        return conversationService.searchHistory(query, limit);
    }
}

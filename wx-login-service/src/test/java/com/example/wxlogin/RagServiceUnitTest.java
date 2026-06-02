package com.example.wxlogin;

import com.example.wxlogin.entity.AiConversation;
import com.example.wxlogin.entity.GpuKnowledge;
import com.example.wxlogin.service.AiConversationService;
import com.example.wxlogin.service.KnowledgeService;
import com.example.wxlogin.service.RagService;
import com.example.wxlogin.service.impl.RagServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * RAG服务单元测试（Mock依赖，无需数据库和API）
 */
public class RagServiceUnitTest {

    private KnowledgeService knowledgeService;
    private AiConversationService conversationService;
    private RagService ragService;

    @BeforeEach
    void setUp() {
        knowledgeService = Mockito.mock(KnowledgeService.class);
        conversationService = Mockito.mock(AiConversationService.class);
        ragService = new RagServiceImpl(knowledgeService, conversationService);
    }

    @Test
    @DisplayName("测试RAG上下文构建：知识库+历史对话同时召回")
    void testRetrieveAndBuildContext() {
        // Mock 知识库数据
        GpuKnowledge k1 = new GpuKnowledge();
        k1.setQuestion("显卡黑屏无信号");
        k1.setCauses("供电不足或接口松动");
        k1.setDiagnosis("检查电源线和显示器连接");
        k1.setSolution("重新插拔电源线和HDMI/DP线");

        when(knowledgeService.search(anyString(), isNull())).thenReturn(Arrays.asList(k1));

        // Mock 历史对话数据
        AiConversation c1 = new AiConversation();
        c1.setQuestion("显卡开机黑屏怎么办");
        c1.setAnswer("首先检查显示器电源和信号线是否连接正常...");

        when(conversationService.searchHistory(anyString(), anyInt())).thenReturn(Arrays.asList(c1));

        String context = ragService.retrieveAndBuildContext("显卡黑屏", 3);

        assertNotNull(context);
        assertTrue(context.contains("已知知识库条目"));
        assertTrue(context.contains("历史类似问题与解答"));
        assertTrue(context.contains("显卡黑屏无信号"));
        assertTrue(context.contains("显卡开机黑屏怎么办"));
        System.out.println("构建的RAG上下文:\n" + context);
    }

    @Test
    @DisplayName("测试RAG空结果：无召回时返回空字符串")
    void testEmptyRetrieve() {
        when(knowledgeService.search(anyString(), isNull())).thenReturn(Arrays.asList());
        when(conversationService.searchHistory(anyString(), anyInt())).thenReturn(Arrays.asList());

        String context = ragService.retrieveAndBuildContext("完全不相关的问题", 3);

        assertTrue(context == null || context.isEmpty());
    }

    @Test
    @DisplayName("测试知识库召回截断：只返回limit条")
    void testKnowledgeLimit() {
        GpuKnowledge k1 = new GpuKnowledge(); k1.setQuestion("Q1");
        GpuKnowledge k2 = new GpuKnowledge(); k2.setQuestion("Q2");
        GpuKnowledge k3 = new GpuKnowledge(); k3.setQuestion("Q3");
        GpuKnowledge k4 = new GpuKnowledge(); k4.setQuestion("Q4");

        when(knowledgeService.search(anyString(), isNull()))
            .thenReturn(Arrays.asList(k1, k2, k3, k4));

        List<GpuKnowledge> result = ragService.retrieveFromKnowledgeBase("test", 2);

        assertEquals(2, result.size());
    }
}

package com.example.wxlogin;

import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.entity.AiConversation;
import com.example.wxlogin.entity.GpuKnowledge;
import com.example.wxlogin.service.AiConversationService;
import com.example.wxlogin.service.KnowledgeDistillService;
import com.example.wxlogin.service.RagService;
import com.example.wxlogin.service.YuanbaoAiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * AI集成测试：验证AI对话、RAG检索、知识提纯全链路
 * 运行前请确保：
 * 1. MySQL数据库已启动且 ai_conversation 表已创建
 * 2. 混元API Key有效（或在application.yml中配置为测试模式）
 * 3. 或添加 @Disabled 跳过需要真实API的测试
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private YuanbaoAiService yuanbaoAiService;

    @Autowired
    private RagService ragService;

    @Autowired
    private AiConversationService conversationService;

    @Autowired
    private KnowledgeDistillService knowledgeDistillService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static Long savedConvId;

    // ========== 1. AI对话接口测试 ==========

    @Test
    @Order(1)
    @DisplayName("测试AI文字对话接口")
    void testChatEndpoint() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("message", "显卡黑屏怎么办");
        request.put("context", new ArrayList<>());
        request.put("scene", "gpu_diagnosis");
        request.put("sessionId", "test_session_" + System.currentTimeMillis());

        MvcResult result = mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.reply").exists())
                .andExpect(jsonPath("$.data.isYuanbao").value(true))
                .andExpect(jsonPath("$.data.convId").exists())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        ApiResponse<Map<String, Object>> apiResponse = objectMapper.readValue(response, ApiResponse.class);
        Map<String, Object> data = apiResponse.getData();
        savedConvId = Long.valueOf(data.get("convId").toString());

        System.out.println("AI回复: " + data.get("reply"));
        System.out.println("对话ID: " + savedConvId);
        Assertions.assertNotNull(savedConvId, "对话应被持久化并返回convId");
    }

    @Test
    @Order(2)
    @DisplayName("测试AI图片分析接口")
    void testChatWithImage() throws Exception {
        // 构造一个小的base64图片（1x1像素透明PNG）
        String tinyPng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

        Map<String, Object> request = new HashMap<>();
        request.put("message", "请分析这张图片");
        request.put("imageBase64", tinyPng);
        request.put("context", new ArrayList<>());
        request.put("scene", "gpu_diagnosis_image");

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.hasImage").value(true))
                .andExpect(jsonPath("$.data.reply").exists());
    }

    // ========== 2. RAG检索测试 ==========

    @Test
    @Order(3)
    @DisplayName("测试RAG知识库检索")
    void testRagKnowledgeRetrieve() {
        String query = "显卡黑屏";
        List<GpuKnowledge> list = ragService.retrieveFromKnowledgeBase(query, 3);
        System.out.println("知识库召回数量: " + list.size());
        list.forEach(k -> System.out.println("  - " + k.getQuestion()));
        Assertions.assertNotNull(list);
    }

    @Test
    @Order(4)
    @DisplayName("测试RAG历史对话检索")
    void testRagHistoryRetrieve() {
        String query = "黑屏";
        List<AiConversation> list = ragService.retrieveFromHistory(query, 3);
        System.out.println("历史对话召回数量: " + list.size());
        list.forEach(c -> System.out.println("  - Q: " + c.getQuestion()));
        Assertions.assertNotNull(list);
    }

    @Test
    @Order(5)
    @DisplayName("测试RAG上下文构建")
    void testRagContextBuild() {
        String query = "显卡黑屏无信号";
        String context = ragService.retrieveAndBuildContext(query, 2);
        System.out.println("RAG上下文长度: " + context.length());
        System.out.println("RAG上下文:\n" + context);
        Assertions.assertNotNull(context);
    }

    // ========== 3. 用户反馈测试 ==========

    @Test
    @Order(6)
    @DisplayName("测试用户反馈接口（点赞）")
    void testFeedbackLike() throws Exception {
        // 如果没有前置对话ID，跳过
        org.junit.jupiter.api.Assumptions.assumeTrue(savedConvId != null, "需要前置对话ID");

        Map<String, Object> request = new HashMap<>();
        request.put("id", savedConvId);
        request.put("helpful", true);

        mockMvc.perform(post("/api/ai/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").value(true));
    }

    // ========== 4. 知识提纯测试 ==========

    @Test
    @Order(7)
    @DisplayName("测试手动触发知识提纯")
    void testTriggerDistill() throws Exception {
        mockMvc.perform(post("/api/ai/admin/trigger-distill")
                        .param("batchSize", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.generatedCount").exists());
    }

    @Test
    @Order(8)
    @DisplayName("测试获取待确认知识列表")
    void testPendingKnowledge() throws Exception {
        mockMvc.perform(get("/api/ai/admin/pending-knowledge"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    // ========== 5. 统计接口测试 ==========

    @Test
    @Order(9)
    @DisplayName("测试统计数据资产接口")
    void testStats() throws Exception {
        mockMvc.perform(get("/api/ai/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.valuableCount").exists());
    }

    // ========== 6. 全文检索测试 ==========

    @Test
    @Order(10)
    @DisplayName("测试历史问答全文检索")
    void testSearchHistory() throws Exception {
        mockMvc.perform(get("/api/ai/search")
                        .param("keyword", "黑屏")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }
}

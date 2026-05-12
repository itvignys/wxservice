package com.example.wxlogin.controller;

import com.example.wxlogin.config.YuanbaoConfig;
import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.dto.ChatRequest;
import com.example.wxlogin.entity.AiConversation;
import com.example.wxlogin.service.AiConversationService;
import com.example.wxlogin.entity.GpuKnowledge;
import com.example.wxlogin.service.KnowledgeDistillService;
import com.example.wxlogin.service.YuanbaoAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI对话 REST 控制器（元宝AI中转代理 + RAG + 数据沉淀）
 */
@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final YuanbaoAiService yuanbaoAiService;
    private final YuanbaoConfig yuanbaoConfig;
    private final AiConversationService conversationService;
    private final KnowledgeDistillService knowledgeDistillService;

    /**
     * AI对话接口（RAG增强）
     * POST /api/ai/chat
     *
     * 请求体:
     * {
     *   "message": "显卡黑屏怎么办",
     *   "context": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}],
     *   "scene": "gpu_diagnosis",
     *   "imageBase64": "data:image/jpeg;base64,...",
     *   "sessionId": "xxx"  // 可选，用于串联同一轮对话
     * }
     */
    @PostMapping("/chat")
    public ApiResponse<Map<String, Object>> chat(@RequestBody ChatRequest request,
                                                  HttpServletRequest httpRequest) {
        log.info("收到AI对话请求，消息长度: {}, 场景: {}, 是否含图片: {}",
            request.getMessage() != null ? request.getMessage().length() : 0,
            request.getScene(),
            request.getImageBase64() != null && !request.getImageBase64().isEmpty());

        if("your-yuanbao-api-key-here".equals(yuanbaoConfig.getApiKey())) {
            return ApiResponse.success(null);
        }

        // 提取用户标识（优先从header，否则用IP+UA哈希兜底）
        String userId = extractUserId(httpRequest);
        String sessionId = request.getSessionId();

        try {
            String reply;
            String source = "yuanbao";
            boolean hasImage = request.getImageBase64() != null && !request.getImageBase64().isEmpty();

            if (hasImage) {
                reply = yuanbaoAiService.chatWithImage(
                    request.getMessage(),
                    request.getImageBase64(),
                    request.getContext()
                );
            } else {
                reply = yuanbaoAiService.chat(request.getMessage(), request.getContext());
            }

            // 持久化对话记录
            Long convId = null;
            try {
                AiConversation saved = conversationService.saveConversation(
                    userId, sessionId,
                    request.getMessage(), reply,
                    request.getImageBase64(), source,
                    null
                );
                convId = saved.getId();
            } catch (Exception ex) {
                log.warn("对话持久化失败（不影响主流程）", ex);
            }

            Map<String, Object> data = new HashMap<>();
            data.put("reply", reply);
            data.put("isYuanbao", true);
            data.put("hasImage", hasImage);
            data.put("convId", convId);

            return ApiResponse.success(data);
        } catch (Exception e) {
            log.error("AI对话失败", e);
            return ApiResponse.fail("AI服务暂时不可用，请稍后重试");
        }
    }

    /**
     * 用户反馈：点赞/点踩
     * POST /api/ai/feedback
     */
    @PostMapping("/feedback")
    public ApiResponse<Boolean> feedback(@RequestBody Map<String, Object> request) {
        Long id = Long.valueOf(request.get("id").toString());
        Boolean helpful = Boolean.valueOf(request.get("helpful").toString());
        boolean result = conversationService.feedback(id, helpful);
        return ApiResponse.success(result);
    }

    /**
     * 检索历史优质问答（RAG检索层，供内部或管理后台使用）
     * GET /api/ai/search?keyword=xxx&limit=5
     */
    @GetMapping("/search")
    public ApiResponse<List<AiConversation>> searchHistory(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "5") int limit) {
        List<AiConversation> list = conversationService.searchHistory(keyword, limit);
        return ApiResponse.success(list);
    }

    /**
     * 统计数据资产
     * GET /api/ai/stats
     */
    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats() {
        Map<String, Object> data = new HashMap<>();
        data.put("valuableCount", conversationService.countValuableAssets());
        data.put("totalCount", conversationService.count());
        data.put("pendingCount", knowledgeDistillService.getPendingConfirmations().size());
        data.put("dailyStats", conversationService.getDailyConversationStats());
        data.put("satisfaction", conversationService.getSatisfactionDistribution());
        data.put("topQuestions", conversationService.getTopQuestions());
        return ApiResponse.success(data);
    }

    private String extractUserId(HttpServletRequest request) {
        String openid = request.getHeader("X-Openid");
        if (openid != null && !openid.isEmpty()) {
            return openid;
        }
        // 兜底：用IP+UA生成匿名标识
        String ip = request.getRemoteAddr();
        String ua = request.getHeader("User-Agent");
        return "anon_" + Math.abs((ip + ua).hashCode());
    }

    // ========== 管理后台接口（数据资产运营） ==========

    /**
     * 查看待确认的知识条目（管理后台）
     * GET /api/ai/admin/pending-knowledge
     */
    @GetMapping("/admin/pending-knowledge")
    public ApiResponse<List<GpuKnowledge>> pendingKnowledge() {
        return ApiResponse.success(knowledgeDistillService.getPendingConfirmations());
    }

    /**
     * 管理员确认知识入库
     * POST /api/ai/admin/confirm-knowledge
     */
    @PostMapping("/admin/confirm-knowledge")
    public ApiResponse<Boolean> confirmKnowledge(@RequestBody Map<String, Object> request) {
        Long id = Long.valueOf(request.get("id").toString());
        boolean result = knowledgeDistillService.confirmAndSave(id);
        return ApiResponse.success(result);
    }

    /**
     * 手动触发知识提纯（管理后台）
     * POST /api/ai/admin/trigger-distill
     */
    @PostMapping("/admin/trigger-distill")
    public ApiResponse<Map<String, Object>> triggerDistill(@RequestParam(defaultValue = "50") int batchSize) {
        List<GpuKnowledge> list = knowledgeDistillService.batchDistill(batchSize);
        Map<String, Object> data = new HashMap<>();
        data.put("generatedCount", list.size());
        data.put("list", list);
        return ApiResponse.success(data);
    }
}

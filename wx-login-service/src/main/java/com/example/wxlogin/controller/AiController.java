package com.example.wxlogin.controller;

import com.example.wxlogin.config.YuanbaoConfig;
import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.dto.ChatRequest;
import com.example.wxlogin.service.YuanbaoAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * AI对话 REST 控制器（元宝AI中转代理）
 */
@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final YuanbaoAiService yuanbaoAiService;
    private final YuanbaoConfig yuanbaoConfig;

    /**
     * AI对话接口
     * POST /api/ai/chat
     *
     * 请求体:
     * {
     *   "message": "显卡黑屏怎么办",
     *   "context": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}],
     *   "scene": "gpu_diagnosis"
     * }
     */
    @PostMapping("/chat")
    public ApiResponse<Map<String, Object>> chat(@RequestBody ChatRequest request) {
        log.info("收到AI对话请求，消息长度: {}, 场景: {}",
            request.getMessage() != null ? request.getMessage().length() : 0,
            request.getScene());

        if("your-yuanbao-api-key-here".equals(yuanbaoConfig.getApiKey())) {
            return ApiResponse.success(null);
        }

        try {
            String reply = yuanbaoAiService.chat(request.getMessage(), request.getContext());

            Map<String, Object> data = new HashMap<>();
            data.put("reply", reply);
            data.put("isYuanbao", true);

            return ApiResponse.success(data);
        } catch (Exception e) {
            log.error("AI对话失败", e);
            return ApiResponse.fail("AI服务暂时不可用，请稍后重试");
        }
    }
}

package com.example.wxlogin.service;

import com.example.wxlogin.config.YuanbaoConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 元宝AI对话服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class YuanbaoAiService {

    private final RestTemplate restTemplate;
    private final YuanbaoConfig yuanbaoConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 发送聊天消息并获取AI回复
     *
     * @param message   用户消息
     * @param context   对话历史上下文（最近N轮），每项包含 role 和 content
     * @return AI回复文本
     */
    public String chat(String message, List<Map<String, String>> context) {
        try {
            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", yuanbaoConfig.getModel());

            // 组装消息列表
            List<Map<String, String>> messages = new ArrayList<>();

            // 添加系统消息
            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", yuanbaoConfig.getSystemPrompt());
            messages.add(systemMsg);

            // 添加历史上下文（限制最近 maxContextRounds 轮）
            if (context != null && !context.isEmpty()) {
                int startIdx = Math.max(0, context.size() - yuanbaoConfig.getMaxContextRounds() * 2);
                for (int i = startIdx; i < context.size(); i++) {
                    messages.add(context.get(i));
                }
            }

            // 添加当前用户消息
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", message);
            messages.add(userMsg);

            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 2048);

            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(yuanbaoConfig.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("调用元宝AI接口，模型: {}", yuanbaoConfig.getModel());

            // 发送请求
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                yuanbaoConfig.getEndpoint(),
                HttpMethod.POST,
                entity,
                String.class
            );

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                JsonNode root = objectMapper.readTree(responseEntity.getBody());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    String reply = choices.get(0).path("message").path("content").asText("");
                    if (!reply.isEmpty()) {
                        log.info("元宝AI回复成功，长度: {}", reply.length());
                        return reply;
                    }
                }
            }

            log.warn("元宝AI返回数据格式异常: {}", responseEntity.getBody());
            throw new RuntimeException("AI返回数据解析失败");

        } catch (Exception e) {
            log.error("调用元宝AI失败", e);
            throw new RuntimeException("AI服务暂时不可用: " + e.getMessage());
        }
    }
}

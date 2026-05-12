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
 * 元宝AI对话服务（RAG增强）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class YuanbaoAiService {

    private final RestTemplate restTemplate;
    private final YuanbaoConfig yuanbaoConfig;
    private final RagService ragService;
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
            // RAG检索：召回相关知识注入Prompt
            String ragContext = ragService.retrieveAndBuildContext(message, 3);
            String systemContent = buildRagSystemPrompt(yuanbaoConfig.getSystemPrompt(), ragContext);

            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", yuanbaoConfig.getModel());

            // 组装消息列表
            List<Map<String, String>> messages = new ArrayList<>();

            // 添加系统消息（RAG增强）
            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", systemContent);
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

    /**
     * 发送图片分析请求并获取AI回复（混元Vision多模态）
     *
     * @param message      用户消息/提问
     * @param imageBase64  图片Base64数据（含MIME前缀，如 data:image/jpeg;base64,...）
     * @param context      对话历史上下文
     * @return AI回复文本
     */
    public String chatWithImage(String message, String imageBase64, List<Map<String, String>> context) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", yuanbaoConfig.getVisionModel());

            List<Map<String, Object>> messages = new ArrayList<>();

            // 系统消息
            Map<String, Object> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", yuanbaoConfig.getSystemPrompt());
            messages.add(systemMsg);

            // 历史上下文
            if (context != null && !context.isEmpty()) {
                int startIdx = Math.max(0, context.size() - yuanbaoConfig.getMaxContextRounds() * 2);
                for (int i = startIdx; i < context.size(); i++) {
                    Map<String, String> ctx = context.get(i);
                    Map<String, Object> msg = new HashMap<>();
                    msg.put("role", ctx.get("role"));
                    msg.put("content", ctx.get("content"));
                    messages.add(msg);
                }
            }

            // 用户多模态消息：文本 + 图片
            List<Map<String, Object>> contents = new ArrayList<>();

            Map<String, Object> textContent = new HashMap<>();
            textContent.put("type", "text");
            textContent.put("text", message != null ? message : "请分析这张图片");
            contents.add(textContent);

            Map<String, Object> imageContent = new HashMap<>();
            imageContent.put("type", "image_url");
            Map<String, Object> imageUrlObj = new HashMap<>();
            imageUrlObj.put("url", imageBase64);
            imageContent.put("image_url", imageUrlObj);
            contents.add(imageContent);

            Map<String, Object> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", contents);
            messages.add(userMsg);

            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 2048);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(yuanbaoConfig.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("调用元宝AI图片分析接口，模型: {}", yuanbaoConfig.getVisionModel());

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
                        log.info("元宝AI图片分析成功，回复长度: {}", reply.length());
                        return reply;
                    }
                }
            }

            log.warn("元宝AI图片分析返回数据格式异常: {}", responseEntity.getBody());
            throw new RuntimeException("AI图片分析返回数据解析失败");

        } catch (Exception e) {
            log.error("调用元宝AI图片分析失败", e);
            throw new RuntimeException("AI图片分析服务暂时不可用: " + e.getMessage());
        }
    }

    /**
     * 构建RAG增强的系统Prompt
     * 将检索到的知识库条目和历史问答追加到System Prompt中
     */
    private String buildRagSystemPrompt(String basePrompt, String ragContext) {
        if (ragContext == null || ragContext.isEmpty()) {
            return basePrompt;
        }
        return basePrompt + "\n\n## 以下是与用户问题相关的参考资料（仅供辅助参考，请结合你的专业知识综合判断）\n\n"
            + ragContext + "\n\n"
            + "请注意：以上参考资料仅供参考，你的回答仍应基于你的专业判断。如果参考资料与用户问题无关，请忽略它们。";
    }
}

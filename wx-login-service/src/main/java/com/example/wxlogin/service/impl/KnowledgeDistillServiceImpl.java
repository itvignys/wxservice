package com.example.wxlogin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.example.wxlogin.config.YuanbaoConfig;
import com.example.wxlogin.entity.AiConversation;
import com.example.wxlogin.entity.GpuKnowledge;
import com.example.wxlogin.mapper.AiConversationMapper;
import com.example.wxlogin.mapper.GpuKnowledgeMapper;
import com.example.wxlogin.service.KnowledgeDistillService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 知识提纯服务实现
 * 调用混元大模型将对话提炼为结构化知识库条目
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KnowledgeDistillServiceImpl implements KnowledgeDistillService {

    private final RestTemplate restTemplate;
    private final YuanbaoConfig yuanbaoConfig;
    private final AiConversationMapper conversationMapper;
    private final GpuKnowledgeMapper knowledgeMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String DISTILL_PROMPT =
        "你是一名GPU维修知识库整理专家。请将以下用户提问和AI回答提炼成标准知识库条目。\n" +
        "输出必须是严格的JSON格式，字段如下：\n" +
        "{\n" +
        "  \"category\": \"问题分类（如：显示问题/驱动问题/供电问题/散热问题/物理损坏/显存核心问题）\",\n" +
        "  \"question\": \"标准问题描述（一句话）\",\n" +
        "  \"causes\": \"常见原因\",\n" +
        "  \"diagnosis\": \"排查方法\",\n" +
        "  \"solution\": \"维修方案\",\n" +
        "  \"difficulty\": \"难度评估（简单/中等/困难）\",\n" +
        "  \"cost\": \"维修成本估计\",\n" +
        "  \"successRate\": \"成功率估计\",\n" +
        "  \"tags\": [\"标签1\", \"标签2\"]\n" +
        "}\n" +
        "注意：只输出JSON，不要任何其他文字。";

    @Override
    public GpuKnowledge distill(AiConversation conversation) {
        String rawJson = callDistillApi(conversation.getQuestion(), conversation.getAnswer());
        GpuKnowledge knowledge = parseDistillResult(rawJson);
        if (knowledge != null) {
            knowledge.setSortOrder(999); // 草稿默认排在后面
            knowledge.setCreatedAt(LocalDateTime.now());
            knowledge.setUpdatedAt(LocalDateTime.now());
            log.info("知识提纯成功, convId={}, question={}", conversation.getId(), knowledge.getQuestion());
        }
        return knowledge;
    }

    @Override
    public List<GpuKnowledge> batchDistill(int batchSize) {
        // 查询 is_helpful=1 且未提纯的记录
        LambdaQueryWrapper<AiConversation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AiConversation::getIsHelpful, 1)
               .eq(AiConversation::getDistilled, 0)
               .orderByAsc(AiConversation::getCreatedAt)
               .last("LIMIT " + batchSize);
        List<AiConversation> list = conversationMapper.selectList(wrapper);

        List<GpuKnowledge> results = new ArrayList<>();
        for (AiConversation conv : list) {
            try {
                GpuKnowledge k = distill(conv);
                if (k != null) {
                    // 先不入正式库，写入待确认表（这里复用gpu_knowledge，用特殊标记或单独字段区分）
                    // 简单方案：先存入gpu_knowledge，但设置一个极低的sortOrder表示草稿
                    knowledgeMapper.insert(k);
                    results.add(k);

                    // 标记该对话已提纯
                    conversationMapper.update(null, new LambdaUpdateWrapper<AiConversation>()
                        .eq(AiConversation::getId, conv.getId())
                        .set(AiConversation::getDistilled, 1));
                }
            } catch (Exception e) {
                log.error("单条知识提纯失败, convId={}", conv.getId(), e);
            }
        }
        log.info("批量知识提纯完成, 处理{}条, 生成{}条", list.size(), results.size());
        return results;
    }

    @Override
    public List<GpuKnowledge> getPendingConfirmations() {
        // 查询sortOrder=999的草稿条目
        LambdaQueryWrapper<GpuKnowledge> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(GpuKnowledge::getSortOrder, 999)
               .orderByDesc(GpuKnowledge::getCreatedAt);
        return knowledgeMapper.selectList(wrapper);
    }

    @Override
    public boolean confirmAndSave(Long knowledgeId) {
        // 管理员确认后，将sortOrder改为正常值（如100），使其在正式知识库中展示
        GpuKnowledge k = knowledgeMapper.selectById(knowledgeId);
        if (k == null) return false;
        k.setSortOrder(100);
        k.setUpdatedAt(LocalDateTime.now());
        knowledgeMapper.updateById(k);
        log.info("知识条目已确认入库, id={}", knowledgeId);
        return true;
    }

    private String callDistillApi(String question, String answer) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", yuanbaoConfig.getModel());

            List<Map<String, String>> messages = new ArrayList<>();
            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", DISTILL_PROMPT);
            messages.add(systemMsg);

            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", "用户提问：" + question + "\n\nAI回答：" + answer);
            messages.add(userMsg);

            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.3); // 低温度保证输出稳定
            requestBody.put("max_tokens", 1024);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(yuanbaoConfig.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                yuanbaoConfig.getEndpoint(), HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    return choices.get(0).path("message").path("content").asText("");
                }
            }
            throw new RuntimeException("AI提纯返回格式异常");
        } catch (Exception e) {
            log.error("调用AI知识提纯失败", e);
            throw new RuntimeException("知识提纯失败: " + e.getMessage());
        }
    }

    private GpuKnowledge parseDistillResult(String rawJson) {
        try {
            // 清理可能的 markdown 代码块
            String clean = rawJson.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```\\s*", "").trim();
            JsonNode node = objectMapper.readTree(clean);
            GpuKnowledge k = new GpuKnowledge();
            k.setCategory(getText(node, "category", "其他"));
            k.setQuestion(getText(node, "question", ""));
            k.setCauses(getText(node, "causes", ""));
            k.setDiagnosis(getText(node, "diagnosis", ""));
            k.setSolution(getText(node, "solution", ""));
            k.setDifficulty(getText(node, "difficulty", "中等"));
            k.setCost(getText(node, "cost", "待评估"));
            k.setSuccessRate(getText(node, "successRate", "待评估"));
            return k;
        } catch (Exception e) {
            log.error("解析知识提纯结果失败, raw={}", rawJson, e);
            return null;
        }
    }

    private String getText(JsonNode node, String field, String defaultVal) {
        JsonNode n = node.path(field);
        return n.isMissingNode() || n.isNull() ? defaultVal : n.asText(defaultVal);
    }
}

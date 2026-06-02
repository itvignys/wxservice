package com.example.wxlogin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.entity.RepairOrder;
import com.example.wxlogin.entity.WxUser;
import com.example.wxlogin.mapper.RepairOrderMapper;
import com.example.wxlogin.mapper.WxUserMapper;
import com.example.wxlogin.service.AiConversationService;
import com.example.wxlogin.service.KnowledgeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * 首页仪表盘统计控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AiConversationService conversationService;
    private final KnowledgeService knowledgeService;
    private final RepairOrderMapper repairOrderMapper;
    private final WxUserMapper wxUserMapper;

    /**
     * 获取首页统计数据
     * GET /api/dashboard/stats
     *
     * 返回:
     * {
     *   "diagnosisCount": 12580,   // 累计AI诊断次数
     *   "knowledgeCount": 17,      // 知识库条目数
     *   "successRate": 92,         // 修复成功率(%)
     *   "expertCount": 8           // 专业工程师数
     * }
     */
    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> stats() {
        Map<String, Object> data = new HashMap<>();

        // 1. 累计AI诊断次数（AI对话总记录数）
        long diagnosisCount = conversationService.count();
        data.put("diagnosisCount", diagnosisCount);

        // 2. 知识库条目数
        long knowledgeCount = knowledgeService.count();
        data.put("knowledgeCount", knowledgeCount);

        // 3. 修复成功率
        int successRate = calculateSuccessRate();
        data.put("successRate", successRate);

        // 4. 专业工程师数（role=engineer，无则兜底8）
        long expertCount = wxUserMapper.selectCount(
                new LambdaQueryWrapper<WxUser>().eq(WxUser::getRole, "engineer")
        );
        data.put("expertCount", expertCount > 0 ? expertCount : 8);

        log.info("返回首页统计数据: {}", data);
        return ApiResponse.success(data);
    }

    /**
     * 计算修复成功率
     * 优先从工单统计：已完成(delivered/after_sale/closed) / 总工单
     * 无工单数据时，使用AI对话满意度(like / total)兜底
     * 都没有则返回默认值 92
     */
    private int calculateSuccessRate() {
        long totalOrders = repairOrderMapper.selectCount(null);
        if (totalOrders > 0) {
            long completedOrders = repairOrderMapper.selectCount(
                    new LambdaQueryWrapper<RepairOrder>()
                            .in(RepairOrder::getStatus, Arrays.asList("delivered", "after_sale", "closed"))
            );
            return (int) (completedOrders * 100 / totalOrders);
        }

        // 无工单数据，尝试用AI满意度兜底
        Map<String, Long> satisfaction = conversationService.getSatisfactionDistribution();
        long like = satisfaction.getOrDefault("like", 0L);
        long dislike = satisfaction.getOrDefault("dislike", 0L);
        long totalFeedback = like + dislike;
        if (totalFeedback > 0) {
            return (int) (like * 100 / totalFeedback);
        }

        // 默认兜底值
        return 92;
    }
}

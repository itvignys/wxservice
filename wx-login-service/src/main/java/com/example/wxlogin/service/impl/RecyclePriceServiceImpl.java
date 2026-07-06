package com.example.wxlogin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.example.wxlogin.entity.RecycleModel;
import com.example.wxlogin.entity.RecyclePriceRule;
import com.example.wxlogin.mapper.RecycleModelMapper;
import com.example.wxlogin.mapper.RecyclePriceRuleMapper;
import com.example.wxlogin.service.RecyclePriceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

/**
 * 估价服务实现
 * 估价算法：最终价 = 基础价 × 成色系数 × 市场系数 + 配置加价
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecyclePriceServiceImpl implements RecyclePriceService {

    private final RecycleModelMapper modelMapper;
    private final RecyclePriceRuleMapper ruleMapper;
    private final ObjectMapper objectMapper;

    /** 默认成色系数（数据库无规则时兜底） */
    private static final Map<String, Double> DEFAULT_FACTORS = Map.of(
            "brand_new", 1.0, "95", 0.9, "90", 0.8, "85", 0.7, "80", 0.6, "faulty", 0.3
    );

    @Override
    public BigDecimal calculate(Long modelId, String conditionLevel, String deviceConfig) {
        RecycleModel model = modelMapper.selectById(modelId);
        if (model == null) {
            throw new RuntimeException("型号不存在");
        }

        RecyclePriceRule rule = getRuleByModelId(modelId);
        double factor = DEFAULT_FACTORS.getOrDefault(conditionLevel, 0.8);
        double marketFactor = 1.0;

        if (rule != null) {
            // 解析成色系数JSON
            if (rule.getConditionFactors() != null) {
                try {
                    Map<String, Double> factors = objectMapper.readValue(rule.getConditionFactors(), Map.class);
                    factor = factors.getOrDefault(conditionLevel, factor);
                } catch (Exception e) {
                    log.warn("解析成色系数失败: {}", rule.getConditionFactors());
                }
            }
            if (rule.getMarketFactor() != null) {
                marketFactor = rule.getMarketFactor().doubleValue();
            }
        }

        // 基础价 × 成色系数 × 市场系数
        BigDecimal basePrice = model.getBasePrice();
        BigDecimal result = basePrice.multiply(BigDecimal.valueOf(factor)).multiply(BigDecimal.valueOf(marketFactor));

        // 配置加价（仅服务器整机）
        if (deviceConfig != null && !deviceConfig.isEmpty() && rule != null && rule.getConfigAdjustments() != null) {
            BigDecimal configAdd = calculateConfigAdjustment(deviceConfig, rule.getConfigAdjustments());
            result = result.add(configAdd);
        }

        // 最低保护价
        if (rule != null && rule.getMinPrice() != null) {
            if (result.compareTo(rule.getMinPrice()) < 0) {
                result = rule.getMinPrice();
            }
        }

        return result.setScale(0, RoundingMode.HALF_UP);
    }

    /** 计算配置加价 */
    private BigDecimal calculateConfigAdjustment(String deviceConfig, String configAdjustments) {
        BigDecimal total = BigDecimal.ZERO;
        try {
            Map<String, String> config = objectMapper.readValue(deviceConfig, Map.class);
            Map<String, Map<String, Number>> adjustments = objectMapper.readValue(configAdjustments, Map.class);

            for (Map.Entry<String, String> entry : config.entrySet()) {
                String type = entry.getKey();       // cpu/memory/storage
                String selectedId = entry.getValue();
                if (selectedId == null || selectedId.isEmpty()) continue;

                Map<String, Number> typeAdjust = adjustments.get(type);
                if (typeAdjust != null && typeAdjust.containsKey(selectedId)) {
                    Number addPrice = typeAdjust.get(selectedId);
                    total = total.add(BigDecimal.valueOf(addPrice.doubleValue()));
                }
            }
        } catch (Exception e) {
            log.warn("计算配置加价失败: {}", e.getMessage());
        }
        return total;
    }

    @Override
    public RecyclePriceRule getRuleByModelId(Long modelId) {
        LambdaQueryWrapper<RecyclePriceRule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecyclePriceRule::getModelId, modelId);
        wrapper.eq(RecyclePriceRule::getEnabled, 1);
        return ruleMapper.selectOne(wrapper);
    }

    @Override
    public List<RecyclePriceRule> getAllRules() {
        LambdaQueryWrapper<RecyclePriceRule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecyclePriceRule::getEnabled, 1);
        return ruleMapper.selectList(wrapper);
    }

    @Override
    public List<RecycleModel> getModelsByCategory(Long categoryId) {
        LambdaQueryWrapper<RecycleModel> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecycleModel::getCategoryId, categoryId);
        wrapper.orderByAsc(RecycleModel::getSortOrder);
        return modelMapper.selectList(wrapper);
    }

    @Override
    public List<RecycleModel> getHotModels() {
        LambdaQueryWrapper<RecycleModel> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecycleModel::getIsHot, 1);
        wrapper.orderByAsc(RecycleModel::getSortOrder);
        return modelMapper.selectList(wrapper);
    }
}

package com.example.wxlogin.service;

import com.example.wxlogin.entity.RecycleModel;
import com.example.wxlogin.entity.RecyclePriceRule;

import java.math.BigDecimal;
import java.util.List;

/**
 * 估价服务接口
 */
public interface RecyclePriceService {

    /** 计算预估价：基础价 × 成色系数 + 配置加价，再乘市场系数 */
    BigDecimal calculate(Long modelId, String conditionLevel, String deviceConfig);

    /** 获取型号的估价规则 */
    RecyclePriceRule getRuleByModelId(Long modelId);

    /** 获取所有估价规则 */
    List<RecyclePriceRule> getAllRules();

    /** 按品类获取型号列表 */
    List<RecycleModel> getModelsByCategory(Long categoryId);

    /** 获取热门型号 */
    List<RecycleModel> getHotModels();
}

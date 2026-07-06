package com.example.wxlogin.controller;

import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.entity.RecycleModel;
import com.example.wxlogin.entity.RecyclePriceRule;
import com.example.wxlogin.service.RecyclePriceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 估价 REST 控制器
 * 路径前缀: /api/recycle/price
 */
@Slf4j
@RestController
@RequestMapping("/api/recycle/price")
@RequiredArgsConstructor
public class RecyclePriceController {

    private final RecyclePriceService priceService;

    /** 计算预估价 */
    @PostMapping("/calculate")
    public ApiResponse<BigDecimal> calculate(@RequestBody Map<String, Object> body) {
        try {
            Long modelId = Long.valueOf(body.get("modelId").toString());
            String conditionLevel = (String) body.get("condition");
            String deviceConfig = body.get("config") != null ? body.get("config").toString() : null;
            BigDecimal price = priceService.calculate(modelId, conditionLevel, deviceConfig);
            return ApiResponse.success(price);
        } catch (Exception e) {
            log.error("估价计算失败", e);
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 获取所有估价规则 */
    @GetMapping("/rules")
    public ApiResponse<List<RecyclePriceRule>> getRules() {
        return ApiResponse.success(priceService.getAllRules());
    }

    /** 按品类获取型号列表 */
    @GetMapping("/models")
    public ApiResponse<List<RecycleModel>> getModels(@RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return ApiResponse.success(priceService.getModelsByCategory(categoryId));
        }
        return ApiResponse.success(priceService.getHotModels());
    }
}

package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 估价规则实体
 */
@Data
@TableName("recycle_price_rule")
public class RecyclePriceRule {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 型号ID */
    private Long modelId;

    /** 成色系数JSON: {"brand_new":1.0,"95":0.9,...} */
    private String conditionFactors;

    /** 配置加价JSON(仅服务器): {"cpu":{},"memory":{},"storage":{}} */
    private String configAdjustments;

    /** 市场调价系数(0.80~1.20) */
    private BigDecimal marketFactor;

    /** 最低回收价(保护价) */
    private BigDecimal minPrice;

    /** 是否启用 */
    private Integer enabled;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

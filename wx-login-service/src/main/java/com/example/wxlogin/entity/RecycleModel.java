package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 回收型号实体
 */
@Data
@TableName("recycle_model")
public class RecycleModel {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 所属品类ID */
    private Long categoryId;

    /** 型号名称 */
    private String name;

    /** 品牌: NVIDIA/AMD/Intel/其他 */
    private String brand;

    /** 规格参数 */
    private String spec;

    /** 基础回收价(元) */
    private BigDecimal basePrice;

    /** 是否热门 */
    private Integer isHot;

    /** 排序 */
    private Integer sortOrder;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

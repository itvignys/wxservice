package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 回收品类实体
 */
@Data
@TableName("recycle_category")
public class RecycleCategory {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 品类名称 */
    private String name;

    /** 品类编码: gpu_server/gpu_card/cpu/memory/storage */
    private String code;

    /** 品类图标(emoji) */
    private String icon;

    /** 品类描述 */
    private String description;

    /** 品类主题色 */
    private String color;

    /** 是否需要配置详情(0否 1是) */
    private Integer hasConfig;

    /** 排序 */
    private Integer sortOrder;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

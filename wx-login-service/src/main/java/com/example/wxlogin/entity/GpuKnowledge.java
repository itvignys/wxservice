package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * GPU显卡维修知识库实体
 */
@Data
@TableName("gpu_knowledge")
public class GpuKnowledge {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 问题分类 */
    private String category;

    /** 问题描述 */
    private String question;

    /** 常见原因 */
    private String causes;

    /** 排查方法 */
    private String diagnosis;

    /** 维修方案 */
    private String solution;

    /** 难度评估 */
    private String difficulty;

    /** 维修成本 */
    private String cost;

    /** 成功率 */
    private String successRate;

    /** 排序序号 */
    private Integer sortOrder;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

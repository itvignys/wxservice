package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 检测报告实体
 */
@Data
@TableName("inspection_report")
public class InspectionReport {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 报告编号 */
    private String reportNo;

    /** 工单ID */
    private Long orderId;

    /** 工单号 */
    private String orderNo;

    /** 检测工程师openid */
    private String engineerOpenid;

    /** 工程师姓名 */
    private String engineerName;

    /** 检测开始时间 */
    private LocalDateTime startTime;

    /** 检测结束时间 */
    private LocalDateTime endTime;

    /** 故障主因 */
    private String mainCause;

    /** 故障次因 */
    private String secondaryCause;

    /** 故障分类 */
    private String faultCategory;

    /** 检测项清单(JSON) */
    private String inspectionItems;

    /** 维修方案描述 */
    private String repairScheme;

    /** 预估工时 */
    private BigDecimal estimatedHours;

    /** 配件需求(JSON) */
    private String partsNeeded;

    /** 预估配件费 */
    private BigDecimal estimatedCostParts;

    /** 预估人工费 */
    private BigDecimal estimatedCostLabor;

    /** 预估上门费 */
    private BigDecimal estimatedCostVisit;

    /** 方案已确认: 0-否 1-是 */
    private Integer schemeConfirmed;

    /** 检测照片(JSON) */
    private String inspectionPhotos;

    /** 检测视频URL */
    private String inspectionVideo;

    /** 客户电子签名URL */
    private String customerSignature;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

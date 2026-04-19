package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 交付凭证实体
 */
@Data
@TableName("delivery_record")
public class DeliveryRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long orderId;

    /** 工单号 */
    private String orderNo;

    /** 交付时间 */
    private LocalDateTime deliveryTime;

    /** 客户电子签名URL */
    private String customerSignature;

    /** 客户评分1-5 */
    private Integer customerRating;

    /** 客户评价文字 */
    private String customerReview;

    /** 质保天数 */
    private Integer warrantyDays;

    /** 质保起始日 */
    private LocalDate warrantyStart;

    /** 质保截止日 */
    private LocalDate warrantyEnd;

    /** 质保范围描述 */
    private String warrantyScope;

    /** 创建时间 */
    private LocalDateTime createdAt;
}

package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 报价单实体
 */
@Data
@TableName("quotation")
public class Quotation {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 报价编号 */
    private String quotationNo;

    /** 工单ID */
    private Long orderId;

    /** 工单号 */
    private String orderNo;

    /** 报价类型: initial/supplement */
    private String quotationType;

    /** 费用明细(JSON) */
    private String feeItems;

    /** 合计金额 */
    private BigDecimal totalAmount;

    /** 优惠金额 */
    private BigDecimal discountAmount;

    /** 优惠原因 */
    private String discountReason;

    /** 实付金额 */
    private BigDecimal actualAmount;

    /** 报价状态: pending/confirmed/rejected/negotiating */
    private String status;

    /** 客户确认时间 */
    private LocalDateTime customerConfirmedAt;

    /** 修订记录(JSON) */
    private String revisionRecords;

    /** 收款状态: unpaid/paid */
    private String paymentStatus;

    /** 收款方式 */
    private String paymentMethod;

    /** 收款时间 */
    private LocalDateTime paymentTime;

    /** 收款确认人openid */
    private String paymentConfirmer;

    /** 补充报价原因 */
    private String supplementReason;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

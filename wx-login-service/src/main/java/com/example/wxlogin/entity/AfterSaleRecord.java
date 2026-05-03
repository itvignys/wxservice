package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 售后记录实体
 */
@Data
@TableName("after_sale_record")
public class AfterSaleRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long orderId;

    /** 工单号 */
    private String orderNo;

    /** 回访记录(JSON) */
    private String visitRecords;

    /** 质保报修(JSON) */
    private String warrantyRepairs;

    /** 客户反馈文字 */
    private String customerFeedback;

    /** 客户评分 */
    private Integer customerRating;

    /** 续保推荐: 0-否 1-是 */
    private Integer renewalRecommended;

    /** 售后状态: tracking/closed */
    private String status;

    /** 关闭时间 */
    private LocalDateTime closeTime;

    /** 关闭方式: auto/manual */
    private String closeType;

    /** 关闭人openid */
    private String closedBy;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

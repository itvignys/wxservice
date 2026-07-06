package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 协商记录实体
 */
@Data
@TableName("recycle_negotiation")
public class RecycleNegotiation {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 订单号 */
    private String orderNo;

    /** 发送方: user/service */
    private String sender;

    /** 消息内容 */
    private String message;

    /** 报价金额 */
    private BigDecimal offerPrice;

    private LocalDateTime createdAt;
}

package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 回收订单实体
 */
@Data
@TableName("recycle_order")
public class RecycleOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 订单号(RC开头) */
    private String orderNo;

    /** 用户openid */
    private String userOpenid;

    /** 品类ID */
    private Long categoryId;

    /** 品类名称 */
    private String categoryName;

    /** 型号ID */
    private Long modelId;

    /** 型号名称 */
    private String modelName;

    /** 型号规格 */
    private String modelSpec;

    /** 成色等级: brand_new/95/90/85/80/faulty */
    private String conditionLevel;

    /** 设备配置JSON(仅服务器): {"cpu":"","memory":"","storage":""} */
    private String deviceConfig;

    /** 设备照片URL JSON数组 */
    private String images;

    /** 预估回收价 */
    private BigDecimal estimatedPrice;

    /** 验机报价 */
    private BigDecimal inspectionPrice;

    /** 最终成交价 */
    private BigDecimal finalPrice;

    /** 回收方式: onsite/mail/instore */
    private String recycleMethod;

    /** 联系人 */
    private String contactName;

    /** 联系电话 */
    private String contactPhone;

    /** 上门地址 */
    private String address;

    /** 预约时间 */
    private String appointmentTime;

    /** 回收网点 */
    private String store;

    /** 备注 */
    private String remark;

    /** 订单状态 */
    private String status;

    /** 验机工程师openid */
    private String engineerOpenid;

    /** 取消原因 */
    private String cancelReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

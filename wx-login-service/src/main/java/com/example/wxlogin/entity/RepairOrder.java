package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 维修工单实体
 */
@Data
@TableName("repair_order")
public class RepairOrder {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单号 */
    private String orderNo;

    /** 客户openid */
    private String customerOpenid;

    /** 客户姓名 */
    private String customerName;

    /** 客户电话 */
    private String customerPhone;

    /** 客户地址 */
    private String customerAddress;

    /** 定位坐标 */
    private String customerLocation;

    /** 设备类型 */
    private String deviceType;

    /** 品牌型号 */
    private String brandModel;

    /** 序列号 */
    private String serialNo;

    /** 故障描述 */
    private String faultDesc;

    /** 故障图片(JSON数组) */
    private String faultImages;

    /** 故障视频URL */
    private String faultVideo;

    /** 紧急程度: normal/urgent/emergency */
    private String urgency;

    /** 期望服务方式: onsite/instore/mail */
    private String serviceType;

    /** 期望时间 */
    private String expectedTime;

    /** 工单状态 */
    private String status;

    /** 当前处理人openid */
    private String assigneeOpenid;

    /** 受理客服openid */
    private String acceptorOpenid;

    /** 工程师openid */
    private String engineerOpenid;

    /** 质检员openid */
    private String inspectorOpenid;

    /** 关联旧工单号 */
    private String relatedOrderNo;

    /** 取消原因 */
    private String cancelReason;

    /** 修改记录(JSON数组) */
    private String modifyRecords;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

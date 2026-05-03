package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 质检报告实体
 */
@Data
@TableName("quality_report")
public class QualityReport {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long orderId;

    /** 工单号 */
    private String orderNo;

    /** 质检员openid */
    private String inspectorOpenid;

    /** 质检员姓名 */
    private String inspectorName;

    /** 质检时间 */
    private LocalDateTime inspectionTime;

    /** 质检项清单(JSON) */
    private String checkItems;

    /** 质检结论: pass/fail */
    private String conclusion;

    /** 不合格原因 */
    private String failReason;

    /** 测试照片(JSON) */
    private String testPhotos;

    /** 测试视频URL */
    private String testVideo;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

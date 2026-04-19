package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 维修过程记录实体
 */
@Data
@TableName("repair_process")
public class RepairProcess {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 工单ID */
    private Long orderId;

    /** 工单号 */
    private String orderNo;

    /** 维修工程师openid */
    private String engineerOpenid;

    /** 工程师姓名 */
    private String engineerName;

    /** 维修开始时间 */
    private LocalDateTime startTime;

    /** 维修结束时间 */
    private LocalDateTime endTime;

    /** 维修步骤记录(JSON) */
    private String stepRecords;

    /** 配件更换记录(JSON) */
    private String partsReplaced;

    /** 实际工时 */
    private BigDecimal actualHours;

    /** 维修结果: fixed/partial/unrepairable */
    private String repairResult;

    /** 维修备注 */
    private String repairRemark;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

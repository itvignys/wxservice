package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 验机报告实体
 */
@Data
@TableName("recycle_inspection")
public class RecycleInspection {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 订单号 */
    private String orderNo;

    /** 外观检查JSON: [{"name":"外壳","ok":true}] */
    private String appearance;

    /** 功能测试JSON: [{"name":"开机自检","ok":true}] */
    private String functions;

    /** 配置核实JSON: [{"name":"型号","value":"A100"}] */
    private String configVerify;

    /** 验机照片URL JSON数组 */
    private String photos;

    /** 验机结论 */
    private String conclusion;

    /** 是否通过 */
    private Integer passed;

    /** 验机工程师 */
    private String inspector;

    /** 验机工程师openid */
    private String inspectorOpenid;

    /** 验机时间 */
    private LocalDateTime inspectTime;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

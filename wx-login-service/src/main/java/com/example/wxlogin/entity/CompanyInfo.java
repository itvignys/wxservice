package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 企业信息实体
 */
@Data
@TableName("company_info")
public class CompanyInfo {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 关联用户openid */
    private String openid;

    /** 企业名称 */
    private String name;

    /** 统一社会信用代码 */
    private String creditCode;

    /** 联系人 */
    private String contact;

    /** 联系电话 */
    private String phone;

    /** 企业地址 */
    private String address;

    /** 备注 */
    private String remark;

    /** 显卡数量范围 */
    private String gpuCount;

    /** 服务需求(JSON数组) */
    private String services;

    /** 状态: pending/approved/rejected */
    private String status;

    /** 是否已使用免费上门检测 */
    private Integer hasUsedFreeService;

    /** 提交时间 */
    private LocalDateTime submitTime;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

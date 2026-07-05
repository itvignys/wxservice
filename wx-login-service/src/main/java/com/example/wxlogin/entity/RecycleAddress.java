package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户地址实体
 */
@Data
@TableName("recycle_address")
public class RecycleAddress {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 用户openid */
    private String userOpenid;

    /** 收货人姓名 */
    private String name;

    /** 手机号 */
    private String phone;

    /** 省 */
    private String province;

    /** 市 */
    private String city;

    /** 区 */
    private String district;

    /** 详细地址 */
    private String detail;

    /** 是否默认地址 */
    private Integer isDefault;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

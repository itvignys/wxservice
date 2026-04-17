package com.example.wxlogin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 微信小程序用户实体类（扩展版）
 */
@Data
@TableName("wx_user")
public class WxUser {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 微信用户的唯一标识 */
    private String openid;

    /** 会话密钥 */
    private String sessionKey;

    /** 用户在微信开放平台下的唯一标识 */
    private String unionid;

    /** 用户昵称 */
    private String nickname;

    /** 头像URL */
    private String avatarUrl;

    /** 手机号 */
    private String phone;

    /** 服务等级: 0-AI问答 1-专家咨询 2-上门服务 */
    private Integer serviceLevel;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}

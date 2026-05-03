package com.example.wxlogin.dto;

import lombok.Data;

/**
 * 登录请求参数
 */
@Data
public class LoginRequest {

    /**
     * 小程序调用 wx.login() 获取的临时登录凭证
     */
    private String code;

}

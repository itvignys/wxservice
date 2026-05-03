package com.example.wxlogin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 微信小程序配置类
 * 从 application.yml 读取微信配置参数
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "wx")
public class WechatConfig {

    /**
     * 微信小程序的 AppID
     */
    private String appid;

    /**
     * 微信小程序的 AppSecret
     */
    private String secret;

    /**
     * 微信登录凭证校验接口
     */
    private String loginUrl;

    /**
     * 构建登录凭证校验请求 URL
     * @param jsCode 小程序调用 wx.login() 获得的 code
     * @return 请求 URL
     */
    public String buildLoginUrl(String jsCode) {
        return String.format("%s?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                loginUrl, appid, secret, jsCode);
    }

}

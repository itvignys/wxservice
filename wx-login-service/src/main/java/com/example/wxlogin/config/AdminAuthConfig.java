package com.example.wxlogin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * 管理后台运营人员配置
 * 在 application.yml 中配置允许的 openid 列表
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "admin")
public class AdminAuthConfig {

    /** 允许访问管理后台的运营人员 openid 列表 */
    private List<String> allowedOpenids;

    /** 管理后台访问密码（二次验证，可选） */
    private String password;

    /**
     * 检查 openid 是否在白名单中
     */
    public boolean isAdmin(String openid) {
        return openid != null && allowedOpenids != null && allowedOpenids.contains(openid);
    }
}

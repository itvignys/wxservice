package com.example.wxlogin.config;

import com.example.wxlogin.interceptor.AdminAuthInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置
 * 注册管理后台权限拦截器
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final AdminAuthInterceptor adminAuthInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 只拦截管理后台接口
        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns("/api/ai/admin/**")
                .excludePathPatterns("/api/ai/chat", "/api/ai/feedback", "/api/ai/search", "/api/ai/stats");
    }
}

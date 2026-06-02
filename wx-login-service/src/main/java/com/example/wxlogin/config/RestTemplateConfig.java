package com.example.wxlogin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * RestTemplate 配置类
 * 用于发送 HTTP 请求调用微信 API、元宝AI等外部服务
 * 配置了连接超时和读取超时，防止外部服务拖垮本服务
 */
@Configuration
public class RestTemplateConfig {

    /** 连接超时：5秒 */
    private static final int CONNECT_TIMEOUT = 5000;
    /** 读取超时：30秒 */
    private static final int READ_TIMEOUT = 30000;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate(clientHttpRequestFactory());
    }

    @Bean
    public ClientHttpRequestFactory clientHttpRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT);
        factory.setReadTimeout(READ_TIMEOUT);
        return factory;
    }

}

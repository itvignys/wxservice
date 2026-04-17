package com.example.wxlogin.util;

import com.example.wxlogin.config.WechatConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * 微信 API 调用工具类
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WechatUtil {

    private final WechatConfig wechatConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * 微信登录凭证校验返回值
     * {"errcode":40125,"errmsg":"invalid appsecret, rid: 69dfb1ed-7ed689cc-28c3c5a7"}
     */
    @lombok.Data
    public static class LoginResult {
        private String openid;
        private String session_key;
        private String unionid;
        private Integer errcode;
        private String errmsg;
    }

    /**
     * 调用微信接口使用 code 换取 openid 和 session_key
     * @param code 小程序调用 wx.login() 获取的临时登录凭证
     * @return 登录结果，包含 openid、session_key 等
     */
    public LoginResult code2Session(String code) {
        String url = wechatConfig.buildLoginUrl(code);
        log.info("调用微信登录凭证校验接口，code: {}", code);

        try {
            // 微信接口可能返回 text/plain，使用 exchange 获取原始字符串再解析
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            String body = response.getBody();
            log.debug("微信接口响应: {}", body);
            
            LoginResult result = objectMapper.readValue(body, LoginResult.class);
            if (result != null && result.getErrcode() != null && result.getErrcode() != 0) {
                log.error("微信登录失败，errcode: {}，errmsg: {}", result.getErrcode(), result.getErrmsg());
            } else {
                log.info("微信登录成功，openid: {}", result != null ? result.getOpenid() : "null");
            }
            return result;
        } catch (Exception e) {
            log.error("调用微信接口异常", e);
            LoginResult errorResult = new LoginResult();
            errorResult.setErrcode(-1);
            errorResult.setErrmsg("调用微信接口异常: " + e.getMessage());
            return errorResult;
        }
    }

}

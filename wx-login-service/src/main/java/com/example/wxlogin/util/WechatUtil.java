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

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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

    // access_token 缓存（微信小程序全局共享，有效期7200秒）
    private final Map<String, TokenCache> tokenCache = new ConcurrentHashMap<>();

    @lombok.Data
    private static class TokenCache {
        private String accessToken;
        private long expireTime;
    }

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
     * 获取微信小程序 access_token（带缓存）
     */
    public String getAccessToken() {
        String cacheKey = wechatConfig.getAppid();
        TokenCache cache = tokenCache.get(cacheKey);
        long now = System.currentTimeMillis();
        if (cache != null && cache.getExpireTime() > now + 60000) {
            return cache.getAccessToken();
        }

        String url = String.format(
            "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
            wechatConfig.getAppid(), wechatConfig.getSecret()
        );

        try {
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            Map<String, Object> result = objectMapper.readValue(response.getBody(), Map.class);
            if (result.containsKey("access_token")) {
                String token = (String) result.get("access_token");
                int expiresIn = ((Number) result.getOrDefault("expires_in", 7200)).intValue();
                TokenCache newCache = new TokenCache();
                newCache.setAccessToken(token);
                newCache.setExpireTime(now + expiresIn * 1000L);
                tokenCache.put(cacheKey, newCache);
                log.info("获取微信access_token成功，有效期{}秒", expiresIn);
                return token;
            } else {
                log.error("获取access_token失败: {}", result);
                return null;
            }
        } catch (Exception e) {
            log.error("获取access_token异常", e);
            return null;
        }
    }

    /**
     * 发送微信小程序订阅消息
     * @param openid 用户openid
     * @param templateId 订阅消息模板ID
     * @param page 点击消息后跳转的页面路径
     * @param data 模板数据 {"keyword1": {"value": "xxx"}, ...}
     */
    public boolean sendSubscribeMessage(String openid, String templateId, String page, Map<String, Object> data) {
        String token = getAccessToken();
        if (token == null) {
            log.error("发送订阅消息失败：无法获取access_token");
            return false;
        }

        String url = "https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=" + token;

        Map<String, Object> body = new java.util.HashMap<>();
        body.put("touser", openid);
        body.put("template_id", templateId);
        if (page != null && !page.isEmpty()) {
            body.put("page", page);
        }
        body.put("data", data);
        // 不强制要求用户订阅后才可收到（开发/体验版有效，线上版本需用户授权）
        body.put("miniprogram_state", "formal");
        body.put("lang", "zh_CN");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            Map<String, Object> result = objectMapper.readValue(response.getBody(), Map.class);
            int errcode = ((Number) result.getOrDefault("errcode", -1)).intValue();
            if (errcode == 0) {
                log.info("订阅消息发送成功，openid={}, templateId={}", openid, templateId);
                return true;
            } else {
                log.warn("订阅消息发送失败，errcode={}, errmsg={}", errcode, result.get("errmsg"));
                return false;
            }
        } catch (Exception e) {
            log.error("发送订阅消息异常", e);
            return false;
        }
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

package com.example.wxlogin.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 短信验证码服务（内存版）
 * 生产环境建议替换为 Redis 存储
 */
@Slf4j
@Service
public class SmsCodeService {

    /**
     * 验证码存储：phone -> code
     */
    private final Map<String, String> codeStore = new ConcurrentHashMap<>();

    /**
     * 验证码过期时间存储：phone -> expireTimeMillis
     */
    private final Map<String, Long> expireStore = new ConcurrentHashMap<>();

    /**
     * 验证码有效期：5分钟
     */
    private static final long EXPIRE_MILLIS = 5 * 60 * 1000;

    /**
     * 发送验证码
     * @param phone 手机号
     * @return 发送的验证码（演示环境直接返回，生产环境应调用短信网关）
     */
    public String sendCode(String phone) {
        // 生成6位随机验证码
        String code = String.format("%06d", new Random().nextInt(999999));

        // 存储验证码和过期时间
        codeStore.put(phone, code);
        expireStore.put(phone, System.currentTimeMillis() + EXPIRE_MILLIS);

        // TODO: 生产环境接入短信网关（阿里云、腾讯云等）
        log.info("【演示模式】向手机号 {} 发送验证码: {}", phone, code);

        return code;
    }

    /**
     * 验证验证码
     * @param phone 手机号
     * @param code 验证码
     * @return 是否验证通过
     */
    public boolean verifyCode(String phone, String code) {
        Long expireTime = expireStore.get(phone);
        if (expireTime == null || System.currentTimeMillis() > expireTime) {
            // 验证码不存在或已过期
            codeStore.remove(phone);
            expireStore.remove(phone);
            return false;
        }

        String storedCode = codeStore.get(phone);
        if (storedCode != null && storedCode.equals(code)) {
            // 验证通过，清除验证码
            codeStore.remove(phone);
            expireStore.remove(phone);
            return true;
        }

        return false;
    }

    /**
     * 清除过期验证码（可配合定时任务使用）
     */
    public void cleanExpiredCodes() {
        long now = System.currentTimeMillis();
        expireStore.entrySet().removeIf(entry -> {
            if (entry.getValue() < now) {
                codeStore.remove(entry.getKey());
                return true;
            }
            return false;
        });
    }

}

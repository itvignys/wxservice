package com.example.wxlogin.service.impl;

import com.example.wxlogin.service.WxSubscribeService;
import com.example.wxlogin.util.WechatUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 微信小程序订阅消息服务实现
 * 模板ID需在小程序后台【订阅消息】中申请，然后配置到 application.yml
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WxSubscribeServiceImpl implements WxSubscribeService {

    private final WechatUtil wechatUtil;

    // 工单状态变更通知模板ID（占位符，需在小程序后台申请后替换）
    private static final String TPL_ORDER_STATUS = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // TODO: 替换为实际模板ID

    @Override
    public boolean sendSubscribeMessage(String openid, String templateId, String page, Map<String, Object> data) {
        if (templateId == null || templateId.contains("xxxx")) {
            log.warn("订阅消息模板ID未配置，跳过发送");
            return false;
        }
        return wechatUtil.sendSubscribeMessage(openid, templateId, page, data);
    }

    @Override
    public boolean sendOrderStatusNotice(String openid, String orderNo, String status, String remark) {
        Map<String, Object> data = new HashMap<>();
        data.put("character_string1", Map.of("value", orderNo));
        data.put("phrase2", Map.of("value", status));
        data.put("thing4", Map.of("value", remark != null ? remark : "您的工单状态已更新，请查看详情"));
        data.put("time5", Map.of("value", java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));

        return sendSubscribeMessage(openid, TPL_ORDER_STATUS,
                "/package-service/pages/order-list/order-list", data);
    }
}

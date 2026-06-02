package com.example.wxlogin.controller;

import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.service.WxSubscribeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 微信小程序消息服务控制器
 * 订阅消息：模板ID需在小程序后台申请，用户授权后服务端可推送
 */
@Slf4j
@RestController
@RequestMapping("/api/wxmsg")
@RequiredArgsConstructor
public class WxMsgController {

    private final WxSubscribeService wxSubscribeService;

    /**
     * 发送订阅消息（管理后台或内部系统调用）
     * POST /api/wxmsg/subscribe-send
     */
    @PostMapping("/subscribe-send")
    public ApiResponse<Boolean> sendSubscribeMessage(@RequestBody Map<String, Object> request) {
        String openid = (String) request.get("openid");
        String templateId = (String) request.get("templateId");
        String page = (String) request.get("page");
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) request.get("data");

        if (openid == null || templateId == null || data == null) {
            return ApiResponse.fail("参数错误：openid、templateId、data必填");
        }

        boolean result = wxSubscribeService.sendSubscribeMessage(openid, templateId, page, data);
        return ApiResponse.success(result);
    }

    /**
     * 发送工单状态变更通知
     * POST /api/wxmsg/order-status
     */
    @PostMapping("/order-status")
    public ApiResponse<Boolean> sendOrderStatusNotice(@RequestBody Map<String, Object> request) {
        String openid = (String) request.get("openid");
        String orderNo = (String) request.get("orderNo");
        String status = (String) request.get("status");
        String remark = (String) request.get("remark");

        if (openid == null || orderNo == null || status == null) {
            return ApiResponse.fail("参数错误：openid、orderNo、status必填");
        }

        boolean result = wxSubscribeService.sendOrderStatusNotice(openid, orderNo, status, remark);
        return ApiResponse.success(result);
    }
}

package com.example.wxlogin.service;

import java.util.Map;

/**
 * 微信小程序订阅消息服务
 */
public interface WxSubscribeService {

    /**
     * 发送订阅消息
     * @param openid 用户openid
     * @param templateId 模板ID
     * @param page 跳转页面
     * @param data 模板数据
     * @return 是否发送成功
     */
    boolean sendSubscribeMessage(String openid, String templateId, String page, Map<String, Object> data);

    /**
     * 发送工单状态变更通知
     * @param openid 用户openid
     * @param orderNo 工单编号
     * @param status 当前状态
     * @param remark 备注说明
     */
    boolean sendOrderStatusNotice(String openid, String orderNo, String status, String remark);
}

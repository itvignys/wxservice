package com.example.wxlogin.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.wxlogin.entity.RecycleOrder;

import java.util.List;

/**
 * 回收订单服务接口
 */
public interface RecycleOrderService {

    /** 创建回收订单 */
    RecycleOrder create(RecycleOrder order);

    /** 根据订单号查询详情 */
    RecycleOrder getByOrderNo(String orderNo);

    /** 分页查询用户订单 */
    IPage<RecycleOrder> getMyOrders(String openid, int page, int size, String status);

    /** 取消订单 */
    RecycleOrder cancel(String orderNo, String cancelReason);

    /** 确认价格 */
    RecycleOrder confirmPrice(String orderNo, java.math.BigDecimal finalPrice);

    /** 拒绝价格（进入协商） */
    RecycleOrder rejectPrice(String orderNo);

    /** 确认收款 */
    RecycleOrder confirmPayment(String orderNo);

    /** 获取验机报告 */
    com.example.wxlogin.entity.RecycleInspection getInspection(String orderNo);

    /** 获取协商记录 */
    List<com.example.wxlogin.entity.RecycleNegotiation> getNegotiations(String orderNo);

    /** 发送协商消息 */
    com.example.wxlogin.entity.RecycleNegotiation sendNegotiation(String orderNo, String sender, String message, java.math.BigDecimal offerPrice);
}

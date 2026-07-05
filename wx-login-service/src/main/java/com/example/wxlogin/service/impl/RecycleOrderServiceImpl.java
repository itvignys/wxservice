package com.example.wxlogin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.wxlogin.entity.RecycleInspection;
import com.example.wxlogin.entity.RecycleNegotiation;
import com.example.wxlogin.entity.RecycleOrder;
import com.example.wxlogin.mapper.RecycleInspectionMapper;
import com.example.wxlogin.mapper.RecycleNegotiationMapper;
import com.example.wxlogin.mapper.RecycleOrderMapper;
import com.example.wxlogin.service.RecycleOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 回收订单服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecycleOrderServiceImpl implements RecycleOrderService {

    private final RecycleOrderMapper orderMapper;
    private final RecycleInspectionMapper inspectionMapper;
    private final RecycleNegotiationMapper negotiationMapper;

    @Override
    @Transactional
    public RecycleOrder create(RecycleOrder order) {
        if (order.getOrderNo() == null || order.getOrderNo().isEmpty()) {
            order.setOrderNo(generateOrderNo());
        }
        if (order.getStatus() == null) {
            order.setStatus("pending_inspection");
        }
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        orderMapper.insert(order);
        log.info("回收订单创建成功: {}", order.getOrderNo());
        return order;
    }

    @Override
    public RecycleOrder getByOrderNo(String orderNo) {
        LambdaQueryWrapper<RecycleOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecycleOrder::getOrderNo, orderNo);
        return orderMapper.selectOne(wrapper);
    }

    @Override
    public IPage<RecycleOrder> getMyOrders(String openid, int page, int size, String status) {
        LambdaQueryWrapper<RecycleOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecycleOrder::getUserOpenid, openid);
        if (status != null && !status.equals("all")) {
            wrapper.eq(RecycleOrder::getStatus, status);
        }
        wrapper.orderByDesc(RecycleOrder::getCreatedAt);
        return orderMapper.selectPage(new Page<>(page, size), wrapper);
    }

    @Override
    public RecycleOrder cancel(String orderNo, String cancelReason) {
        RecycleOrder order = getByOrderNo(orderNo);
        if (order == null) throw new RuntimeException("订单不存在");
        if (!"pending_inspection".equals(order.getStatus())) {
            throw new RuntimeException("当前状态不可取消");
        }
        order.setStatus("cancelled");
        order.setCancelReason(cancelReason);
        order.setUpdatedAt(LocalDateTime.now());
        orderMapper.updateById(order);
        return order;
    }

    @Override
    public RecycleOrder confirmPrice(String orderNo, BigDecimal finalPrice) {
        RecycleOrder order = getByOrderNo(orderNo);
        if (order == null) throw new RuntimeException("订单不存在");
        if (!"price_pending".equals(order.getStatus()) && !"negotiating".equals(order.getStatus())) {
            throw new RuntimeException("当前状态不可确认价格");
        }
        order.setStatus("payment_pending");
        order.setFinalPrice(finalPrice != null ? finalPrice : order.getInspectionPrice());
        order.setUpdatedAt(LocalDateTime.now());
        orderMapper.updateById(order);
        return order;
    }

    @Override
    public RecycleOrder rejectPrice(String orderNo) {
        RecycleOrder order = getByOrderNo(orderNo);
        if (order == null) throw new RuntimeException("订单不存在");
        if (!"price_pending".equals(order.getStatus())) {
            throw new RuntimeException("当前状态不可拒绝价格");
        }
        order.setStatus("negotiating");
        order.setUpdatedAt(LocalDateTime.now());
        orderMapper.updateById(order);
        return order;
    }

    @Override
    public RecycleOrder confirmPayment(String orderNo) {
        RecycleOrder order = getByOrderNo(orderNo);
        if (order == null) throw new RuntimeException("订单不存在");
        if (!"payment_pending".equals(order.getStatus())) {
            throw new RuntimeException("当前状态不可确认收款");
        }
        order.setStatus("completed");
        order.setUpdatedAt(LocalDateTime.now());
        orderMapper.updateById(order);
        return order;
    }

    @Override
    public RecycleInspection getInspection(String orderNo) {
        LambdaQueryWrapper<RecycleInspection> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecycleInspection::getOrderNo, orderNo);
        return inspectionMapper.selectOne(wrapper);
    }

    @Override
    public List<RecycleNegotiation> getNegotiations(String orderNo) {
        LambdaQueryWrapper<RecycleNegotiation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RecycleNegotiation::getOrderNo, orderNo);
        wrapper.orderByAsc(RecycleNegotiation::getCreatedAt);
        return negotiationMapper.selectList(wrapper);
    }

    @Override
    public RecycleNegotiation sendNegotiation(String orderNo, String sender, String message, BigDecimal offerPrice) {
        RecycleNegotiation neg = new RecycleNegotiation();
        neg.setOrderNo(orderNo);
        neg.setSender(sender);
        neg.setMessage(message);
        neg.setOfferPrice(offerPrice);
        neg.setCreatedAt(LocalDateTime.now());
        negotiationMapper.insert(neg);
        return neg;
    }

    private String generateOrderNo() {
        return "RC" + System.currentTimeMillis() + String.format("%04d", (int) (Math.random() * 10000));
    }
}

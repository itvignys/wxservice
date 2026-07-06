package com.example.wxlogin.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.entity.RecycleInspection;
import com.example.wxlogin.entity.RecycleNegotiation;
import com.example.wxlogin.entity.RecycleOrder;
import com.example.wxlogin.service.RecycleOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 回收订单 REST 控制器
 * 路径前缀: /api/recycle/order
 */
@Slf4j
@RestController
@RequestMapping("/api/recycle/order")
@RequiredArgsConstructor
public class RecycleOrderController {

    private final RecycleOrderService orderService;

    /** 创建回收订单 */
    @PostMapping("/create")
    public ApiResponse<RecycleOrder> create(@RequestBody RecycleOrder order) {
        log.info("创建回收订单: {}", order.getOrderNo());
        try {
            return ApiResponse.success("订单创建成功", orderService.create(order));
        } catch (Exception e) {
            log.error("创建订单失败", e);
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 获取订单详情 */
    @GetMapping("/{orderNo}")
    public ApiResponse<RecycleOrder> getDetail(@PathVariable String orderNo) {
        RecycleOrder order = orderService.getByOrderNo(orderNo);
        if (order == null) return ApiResponse.fail("订单不存在");
        return ApiResponse.success(order);
    }

    /** 获取我的订单列表（分页） */
    @GetMapping("/my")
    public ApiResponse<IPage<RecycleOrder>> getMyOrders(
            @RequestHeader("X-Openid") String openid,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all") String status) {
        return ApiResponse.success(orderService.getMyOrders(openid, page, size, status));
    }

    /** 取消订单 */
    @PostMapping("/cancel")
    public ApiResponse<RecycleOrder> cancel(@RequestBody Map<String, String> body) {
        try {
            String cancelReason = body.get("cancelReason");
            return ApiResponse.success("订单已取消", orderService.cancel(body.get("orderNo"), cancelReason));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 确认价格 */
    @PostMapping("/confirm-price")
    public ApiResponse<RecycleOrder> confirmPrice(@RequestBody Map<String, Object> body) {
        try {
            BigDecimal finalPrice = body.get("finalPrice") != null
                    ? new BigDecimal(body.get("finalPrice").toString()) : null;
            return ApiResponse.success("价格已确认", orderService.confirmPrice((String) body.get("orderNo"), finalPrice));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 拒绝价格（进入协商） */
    @PostMapping("/reject-price")
    public ApiResponse<RecycleOrder> rejectPrice(@RequestBody Map<String, String> body) {
        try {
            return ApiResponse.success("已进入协商", orderService.rejectPrice(body.get("orderNo")));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 确认收款 */
    @PostMapping("/confirm-payment")
    public ApiResponse<RecycleOrder> confirmPayment(@RequestBody Map<String, String> body) {
        try {
            return ApiResponse.success("收款已确认", orderService.confirmPayment(body.get("orderNo")));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 获取验机报告 */
    @GetMapping("/inspection/{orderNo}")
    public ApiResponse<RecycleInspection> getInspection(@PathVariable String orderNo) {
        RecycleInspection inspection = orderService.getInspection(orderNo);
        return ApiResponse.success(inspection);
    }

    /** 获取协商记录 */
    @GetMapping("/negotiations/{orderNo}")
    public ApiResponse<List<RecycleNegotiation>> getNegotiations(@PathVariable String orderNo) {
        return ApiResponse.success(orderService.getNegotiations(orderNo));
    }

    /** 发送协商消息 */
    @PostMapping("/negotiate")
    public ApiResponse<RecycleNegotiation> sendNegotiation(@RequestBody Map<String, Object> body) {
        try {
            String orderNo = (String) body.get("orderNo");
            String sender = (String) body.get("sender");
            String text = (String) body.get("text");
            BigDecimal offerPrice = body.get("price") != null
                    ? new BigDecimal(body.get("price").toString()) : null;
            return ApiResponse.success(orderService.sendNegotiation(orderNo, sender, text, offerPrice));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }
}

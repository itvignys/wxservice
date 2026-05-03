package com.example.wxlogin.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.wxlogin.dto.ApiResponse;
import com.example.wxlogin.entity.RepairOrder;
import com.example.wxlogin.service.RepairOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 维修工单 REST 控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class RepairOrderController {

    private final RepairOrderService repairOrderService;

    /** 创建工单（客户报修） */
    @PostMapping("/create")
    public ApiResponse<RepairOrder> createOrder(@RequestBody RepairOrder order) {
        try {
            RepairOrder created = repairOrderService.createOrder(order);
            return ApiResponse.success("报修成功", created);
        } catch (Exception e) {
            log.error("创建工单失败", e);
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 修改工单（仅待受理状态） */
    @PutMapping("/update")
    public ApiResponse<RepairOrder> updateOrder(@RequestBody RepairOrder order) {
        try {
            RepairOrder updated = repairOrderService.updateOrder(order);
            return ApiResponse.success("修改成功", updated);
        } catch (Exception e) {
            log.error("修改工单失败", e);
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 获取工单详情 */
    @GetMapping("/{orderId}")
    public ApiResponse<RepairOrder> getOrderDetail(@PathVariable Integer orderId) {
        RepairOrder order = repairOrderService.getOrderDetail(orderId);
        if (order == null) return ApiResponse.fail("工单不存在");
        return ApiResponse.success(order);
    }

    /** 获取我的工单列表（客户） */
    @GetMapping("/my")
    public ApiResponse<IPage<RepairOrder>> getMyOrders(
            @RequestHeader("X-Openid") String openid,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(repairOrderService.getMyOrders(openid, page, size, status));
    }

    /** 获取待受理列表（客服） */
    @GetMapping("/pending")
    public ApiResponse<IPage<RepairOrder>> getPendingOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(repairOrderService.getPendingOrders(page, size));
    }

    /** 获取工程师任务列表 */
    @GetMapping("/engineer")
    public ApiResponse<IPage<RepairOrder>> getEngineerTasks(
            @RequestHeader("X-Openid") String openid,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(repairOrderService.getEngineerTasks(openid, page, size, status));
    }

    /** 获取待质检列表 */
    @GetMapping("/inspection")
    public ApiResponse<IPage<RepairOrder>> getInspectionTasks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(repairOrderService.getInspectionTasks(page, size));
    }

    /** 获取全部工单（客服/管理） */
    @GetMapping("/all")
    public ApiResponse<IPage<RepairOrder>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return ApiResponse.success(repairOrderService.getAllOrders(page, size, status, keyword));
    }

    /** 受理工单（客服） */
    @PostMapping("/accept")
    public ApiResponse<RepairOrder> acceptOrder(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            String acceptorOpenid = (String) data.get("acceptorOpenid");
            String engineerOpenid = (String) data.get("engineerOpenid");
            return ApiResponse.success("受理成功", repairOrderService.acceptOrder(orderId, acceptorOpenid, engineerOpenid));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 开始检测 */
    @PostMapping("/start-inspection")
    public ApiResponse<RepairOrder> startInspection(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success(repairOrderService.startInspection(orderId));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 提交维修方案 */
    @PostMapping("/submit-scheme")
    public ApiResponse<RepairOrder> submitScheme(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("方案提交成功", repairOrderService.submitScheme(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 确认方案（客户） */
    @PostMapping("/confirm-scheme")
    public ApiResponse<RepairOrder> confirmScheme(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("方案已确认", repairOrderService.confirmScheme(orderId));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 拒绝方案（客户） */
    @PostMapping("/reject-scheme")
    public ApiResponse<RepairOrder> rejectScheme(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            String reason = (String) data.get("reason");
            return ApiResponse.success(repairOrderService.rejectScheme(orderId, reason));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 提交报价 */
    @PostMapping("/submit-quotation")
    public ApiResponse<RepairOrder> submitQuotation(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("报价提交成功", repairOrderService.submitQuotation(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 确认报价（客户） */
    @PostMapping("/confirm-quotation")
    public ApiResponse<RepairOrder> confirmQuotation(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("报价已确认", repairOrderService.confirmQuotation(orderId));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 拒绝报价（客户） */
    @PostMapping("/reject-quotation")
    public ApiResponse<RepairOrder> rejectQuotation(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            String reason = (String) data.get("reason");
            return ApiResponse.success(repairOrderService.rejectQuotation(orderId, reason));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 修订报价 */
    @PostMapping("/revise-quotation")
    public ApiResponse<RepairOrder> reviseQuotation(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("报价修订成功", repairOrderService.reviseQuotation(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 补充报价 */
    @PostMapping("/supplement-quotation")
    public ApiResponse<RepairOrder> supplementQuotation(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("补充报价提交成功", repairOrderService.supplementQuotation(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 开始维修 */
    @PostMapping("/start-repair")
    public ApiResponse<RepairOrder> startRepair(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("维修已开始", repairOrderService.startRepair(orderId));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 提交维修记录 */
    @PostMapping("/repair-process")
    public ApiResponse<RepairOrder> submitRepairProcess(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("维修记录已提交", repairOrderService.submitRepairProcess(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 完成维修 */
    @PostMapping("/complete-repair")
    public ApiResponse<RepairOrder> completeRepair(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("维修已完成", repairOrderService.completeRepair(orderId));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 提交质检报告 */
    @PostMapping("/quality-report")
    public ApiResponse<RepairOrder> submitQualityReport(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("质检报告已提交", repairOrderService.submitQualityReport(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 客户签收 */
    @PostMapping("/sign-delivery")
    public ApiResponse<RepairOrder> signDelivery(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("签收成功", repairOrderService.signDelivery(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 客户评价 */
    @PostMapping("/rating")
    public ApiResponse<RepairOrder> submitRating(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("评价成功", repairOrderService.submitRating(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 关闭工单（客服） */
    @PostMapping("/close")
    public ApiResponse<RepairOrder> closeOrder(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            String reason = (String) data.get("reason");
            String closedBy = (String) data.get("closedBy");
            return ApiResponse.success("工单已关闭", repairOrderService.closeOrder(orderId, reason, closedBy));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 确认收款（客服） */
    @PostMapping("/confirm-payment")
    public ApiResponse<RepairOrder> confirmPayment(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("收款确认成功", repairOrderService.confirmPayment(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 提交售后反馈（客户） */
    @PostMapping("/after-sale")
    public ApiResponse<RepairOrder> submitAfterSale(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("售后反馈已提交", repairOrderService.submitAfterSale(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }

    /** 添加回访记录（客服） */
    @PostMapping("/visit-record")
    public ApiResponse<RepairOrder> addVisitRecord(@RequestBody Map<String, Object> data) {
        try {
            Integer orderId = (Integer) data.get("orderId");
            return ApiResponse.success("回访记录已添加", repairOrderService.addVisitRecord(orderId, data));
        } catch (Exception e) {
            return ApiResponse.fail(e.getMessage());
        }
    }
}

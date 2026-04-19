package com.example.wxlogin.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.wxlogin.entity.RepairOrder;

import java.util.List;
import java.util.Map;

/**
 * 维修工单服务接口
 */
public interface RepairOrderService {

    /** 创建工单（客户报修） */
    RepairOrder createOrder(RepairOrder order);

    /** 修改工单（仅待受理状态） */
    RepairOrder updateOrder(RepairOrder order);

    /** 获取工单详情 */
    RepairOrder getOrderDetail(Integer orderId);

    /** 获取我的工单列表（客户） */
    IPage<RepairOrder> getMyOrders(String openid, int page, int size, String status);

    /** 获取待受理列表（客服） */
    IPage<RepairOrder> getPendingOrders(int page, int size);

    /** 获取工程师任务列表 */
    IPage<RepairOrder> getEngineerTasks(String engineerOpenid, int page, int size, String status);

    /** 获取待质检列表 */
    IPage<RepairOrder> getInspectionTasks(int page, int size);

    /** 获取全部工单（客服/管理） */
    IPage<RepairOrder> getAllOrders(int page, int size, String status, String keyword);

    /** 受理工单（客服） */
    RepairOrder acceptOrder(Integer orderId, String acceptorOpenid, String engineerOpenid);

    /** 开始检测 */
    RepairOrder startInspection(Integer orderId);

    /** 提交维修方案（检测报告） */
    RepairOrder submitScheme(Integer orderId, Map<String, Object> schemeData);

    /** 确认方案（客户） */
    RepairOrder confirmScheme(Integer orderId);

    /** 拒绝方案（客户） */
    RepairOrder rejectScheme(Integer orderId, String reason);

    /** 提交报价 */
    RepairOrder submitQuotation(Integer orderId, Map<String, Object> quotationData);

    /** 确认报价（客户） */
    RepairOrder confirmQuotation(Integer orderId);

    /** 拒绝报价（客户） */
    RepairOrder rejectQuotation(Integer orderId, String reason);

    /** 修订报价 */
    RepairOrder reviseQuotation(Integer orderId, Map<String, Object> quotationData);

    /** 补充报价 */
    RepairOrder supplementQuotation(Integer orderId, Map<String, Object> supplementData);

    /** 开始维修 */
    RepairOrder startRepair(Integer orderId);

    /** 提交维修过程记录 */
    RepairOrder submitRepairProcess(Integer orderId, Map<String, Object> processData);

    /** 完成维修 */
    RepairOrder completeRepair(Integer orderId);

    /** 提交质检报告 */
    RepairOrder submitQualityReport(Integer orderId, Map<String, Object> reportData);

    /** 客户签收 */
    RepairOrder signDelivery(Integer orderId, Map<String, Object> deliveryData);

    /** 客户评价 */
    RepairOrder submitRating(Integer orderId, Map<String, Object> ratingData);

    /** 关闭工单（客服） */
    RepairOrder closeOrder(Integer orderId, String reason, String closedBy);

    /** 确认收款（客服） */
    RepairOrder confirmPayment(Integer orderId, Map<String, Object> paymentData);

    /** 提交售后反馈（客户） */
    RepairOrder submitAfterSale(Integer orderId, Map<String, Object> afterSaleData);

    /** 添加回访记录（客服） */
    RepairOrder addVisitRecord(Integer orderId, Map<String, Object> visitData);
}

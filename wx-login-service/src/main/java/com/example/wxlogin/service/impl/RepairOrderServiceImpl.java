package com.example.wxlogin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.wxlogin.entity.RepairOrder;
import com.example.wxlogin.mapper.RepairOrderMapper;
import com.example.wxlogin.service.RepairOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 维修工单服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RepairOrderServiceImpl implements RepairOrderService {

    private final RepairOrderMapper repairOrderMapper;

    @Override
    @Transactional
    public RepairOrder createOrder(RepairOrder order) {
        order.setOrderNo(generateOrderNo());
        order.setStatus("pending");
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.insert(order);
        log.info("创建工单成功: {}", order.getOrderNo());
        return order;
    }

    @Override
    @Transactional
    public RepairOrder updateOrder(RepairOrder order) {
        RepairOrder existing = repairOrderMapper.selectById(order.getId());
        if (existing == null) {
            throw new RuntimeException("工单不存在");
        }
        if (!"pending".equals(existing.getStatus())) {
            throw new RuntimeException("仅待受理状态的工单可修改");
        }
        // 记录修改
        String modifyRecords = existing.getModifyRecords();
        String newRecord = String.format("{\"time\":\"%s\",\"field\":\"update\"}",
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        if (modifyRecords == null || modifyRecords.isEmpty()) {
            modifyRecords = "[" + newRecord + "]";
        } else {
            modifyRecords = modifyRecords.substring(0, modifyRecords.length() - 1) + "," + newRecord + "]";
        }
        existing.setModifyRecords(modifyRecords);

        // 更新允许修改的字段
        if (order.getCustomerName() != null) existing.setCustomerName(order.getCustomerName());
        if (order.getCustomerPhone() != null) existing.setCustomerPhone(order.getCustomerPhone());
        if (order.getCustomerAddress() != null) existing.setCustomerAddress(order.getCustomerAddress());
        if (order.getCustomerLocation() != null) existing.setCustomerLocation(order.getCustomerLocation());
        if (order.getDeviceType() != null) existing.setDeviceType(order.getDeviceType());
        if (order.getBrandModel() != null) existing.setBrandModel(order.getBrandModel());
        if (order.getSerialNo() != null) existing.setSerialNo(order.getSerialNo());
        if (order.getFaultDesc() != null) existing.setFaultDesc(order.getFaultDesc());
        if (order.getFaultImages() != null) existing.setFaultImages(order.getFaultImages());
        if (order.getFaultVideo() != null) existing.setFaultVideo(order.getFaultVideo());
        if (order.getUrgency() != null) existing.setUrgency(order.getUrgency());
        if (order.getServiceType() != null) existing.setServiceType(order.getServiceType());
        if (order.getExpectedTime() != null) existing.setExpectedTime(order.getExpectedTime());
        if (order.getRelatedOrderNo() != null) existing.setRelatedOrderNo(order.getRelatedOrderNo());

        existing.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(existing);
        return existing;
    }

    @Override
    public RepairOrder getOrderDetail(Integer orderId) {
        return repairOrderMapper.selectById(orderId);
    }

    @Override
    public IPage<RepairOrder> getMyOrders(String openid, int page, int size, String status) {
        Page<RepairOrder> pageReq = new Page<>(page, size);
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RepairOrder::getCustomerOpenid, openid);
        if (status != null && !status.isEmpty()) {
            wrapper.eq(RepairOrder::getStatus, status);
        }
        wrapper.orderByDesc(RepairOrder::getCreatedAt);
        return repairOrderMapper.selectPage(pageReq, wrapper);
    }

    @Override
    public IPage<RepairOrder> getPendingOrders(int page, int size) {
        Page<RepairOrder> pageReq = new Page<>(page, size);
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RepairOrder::getStatus, "pending");
        wrapper.orderByAsc(RepairOrder::getCreatedAt);
        return repairOrderMapper.selectPage(pageReq, wrapper);
    }

    @Override
    public IPage<RepairOrder> getEngineerTasks(String engineerOpenid, int page, int size, String status) {
        Page<RepairOrder> pageReq = new Page<>(page, size);
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.eq(RepairOrder::getEngineerOpenid, engineerOpenid)
                .or().eq(RepairOrder::getInspectorOpenid, engineerOpenid));
        if (status != null && !status.isEmpty()) {
            wrapper.eq(RepairOrder::getStatus, status);
        }
        wrapper.orderByDesc(RepairOrder::getUpdatedAt);
        return repairOrderMapper.selectPage(pageReq, wrapper);
    }

    @Override
    public IPage<RepairOrder> getInspectionTasks(int page, int size) {
        Page<RepairOrder> pageReq = new Page<>(page, size);
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RepairOrder::getStatus, "waiting_inspection");
        wrapper.orderByAsc(RepairOrder::getUpdatedAt);
        return repairOrderMapper.selectPage(pageReq, wrapper);
    }

    @Override
    public IPage<RepairOrder> getAllOrders(int page, int size, String status, String keyword) {
        Page<RepairOrder> pageReq = new Page<>(page, size);
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq(RepairOrder::getStatus, status);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(RepairOrder::getOrderNo, keyword)
                    .or().like(RepairOrder::getCustomerName, keyword)
                    .or().like(RepairOrder::getDeviceType, keyword)
                    .or().like(RepairOrder::getFaultDesc, keyword));
        }
        wrapper.orderByDesc(RepairOrder::getCreatedAt);
        return repairOrderMapper.selectPage(pageReq, wrapper);
    }

    @Override
    @Transactional
    public RepairOrder acceptOrder(Integer orderId, String acceptorOpenid, String engineerOpenid) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"pending".equals(order.getStatus())) throw new RuntimeException("工单状态不允许受理");
        order.setStatus("accepted");
        order.setAcceptorOpenid(acceptorOpenid);
        order.setEngineerOpenid(engineerOpenid);
        order.setInspectorOpenid(engineerOpenid);
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder startInspection(Integer orderId) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"accepted".equals(order.getStatus())) throw new RuntimeException("工单状态不允许开始检测");
        order.setStatus("inspecting");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder submitScheme(Integer orderId, Map<String, Object> schemeData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"inspecting".equals(order.getStatus())) throw new RuntimeException("工单状态不允许提交方案");
        order.setStatus("scheme_pending");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder confirmScheme(Integer orderId) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"scheme_pending".equals(order.getStatus())) throw new RuntimeException("工单状态不允许确认方案");
        order.setStatus("quotation_pending");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder rejectScheme(Integer orderId, String reason) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"scheme_pending".equals(order.getStatus())) throw new RuntimeException("工单状态不允许拒绝方案");
        order.setStatus("inspecting");
        order.setCancelReason(reason);
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder submitQuotation(Integer orderId, Map<String, Object> quotationData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"quotation_pending".equals(order.getStatus())) throw new RuntimeException("工单状态不允许提交报价");
        // 报价状态保持不变，等待客户确认
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder confirmQuotation(Integer orderId) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"quotation_pending".equals(order.getStatus())) throw new RuntimeException("工单状态不允许确认报价");
        order.setStatus("waiting_repair");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder rejectQuotation(Integer orderId, String reason) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"quotation_pending".equals(order.getStatus())) throw new RuntimeException("工单状态不允许拒绝报价");
        // 拒绝报价后回到方案状态，可以修订报价
        order.setStatus("scheme_pending");
        order.setCancelReason(reason);
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder reviseQuotation(Integer orderId, Map<String, Object> quotationData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"scheme_pending".equals(order.getStatus())) throw new RuntimeException("工单状态不允许修订报价");
        order.setStatus("quotation_pending");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder supplementQuotation(Integer orderId, Map<String, Object> supplementData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        // 补充报价在维修中状态提交
        if (!"repairing".equals(order.getStatus()) && !"waiting_repair".equals(order.getStatus())) {
            throw new RuntimeException("工单状态不允许补充报价");
        }
        order.setStatus("quotation_pending");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder startRepair(Integer orderId) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"waiting_repair".equals(order.getStatus())) throw new RuntimeException("工单状态不允许开始维修");
        order.setStatus("repairing");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder submitRepairProcess(Integer orderId, Map<String, Object> processData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"repairing".equals(order.getStatus())) throw new RuntimeException("工单状态不允许提交维修记录");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder completeRepair(Integer orderId) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"repairing".equals(order.getStatus())) throw new RuntimeException("工单状态不允许完成维修");
        order.setStatus("waiting_inspection");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder submitQualityReport(Integer orderId, Map<String, Object> reportData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"waiting_inspection".equals(order.getStatus())) throw new RuntimeException("工单状态不允许提交质检");
        String conclusion = (String) reportData.get("conclusion");
        if ("passed".equals(conclusion)) {
            order.setStatus("quality_passed");
        } else {
            // 质检不通过，返修
            order.setStatus("repairing");
        }
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder signDelivery(Integer orderId, Map<String, Object> deliveryData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"quality_passed".equals(order.getStatus())) throw new RuntimeException("工单状态不允许签收");
        order.setStatus("delivered");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder submitRating(Integer orderId, Map<String, Object> ratingData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"delivered".equals(order.getStatus())) throw new RuntimeException("工单状态不允许评价");
        order.setStatus("after_sale");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder closeOrder(Integer orderId, String reason, String closedBy) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        order.setStatus("closed");
        order.setCancelReason(reason);
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder confirmPayment(Integer orderId, Map<String, Object> paymentData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder submitAfterSale(Integer orderId, Map<String, Object> afterSaleData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        if (!"after_sale".equals(order.getStatus()) && !"delivered".equals(order.getStatus())) {
            throw new RuntimeException("工单状态不允许提交售后");
        }
        order.setStatus("after_sale");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder addVisitRecord(Integer orderId, Map<String, Object> visitData) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) throw new RuntimeException("工单不存在");
        order.setUpdatedAt(LocalDateTime.now());
        repairOrderMapper.updateById(order);
        return order;
    }

    /** 生成工单号: WX + 年月日 + 4位随机数 */
    private String generateOrderNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "WX" + date + random;
    }
}

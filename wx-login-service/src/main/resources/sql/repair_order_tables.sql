-- ============================================
-- 维修工单系统 - 数据库建表脚本
-- 执行前请确保已连接到 gpu 数据库
-- ============================================

-- 1. 扩展 wx_user 表，新增角色字段
ALTER TABLE wx_user
  ADD COLUMN role VARCHAR(32) DEFAULT 'customer' COMMENT '角色: customer-客户, service-客服, engineer-工程师, inspector-质检员, admin-管理员' AFTER service_level;

-- 2. 创建维修工单表
CREATE TABLE IF NOT EXISTS repair_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '工单号，如WX20250701001',
    customer_openid VARCHAR(64) NOT NULL COMMENT '客户openid',
    customer_name VARCHAR(64) DEFAULT NULL COMMENT '客户姓名',
    customer_phone VARCHAR(20) DEFAULT NULL COMMENT '客户电话',
    customer_address VARCHAR(512) DEFAULT NULL COMMENT '客户地址',
    customer_location VARCHAR(128) DEFAULT NULL COMMENT '定位坐标',
    device_type VARCHAR(64) DEFAULT NULL COMMENT '设备类型',
    brand_model VARCHAR(128) DEFAULT NULL COMMENT '品牌型号',
    serial_no VARCHAR(64) DEFAULT NULL COMMENT '序列号',
    fault_desc TEXT COMMENT '故障描述',
    fault_images JSON DEFAULT NULL COMMENT '故障图片URL数组，最多9张',
    fault_video VARCHAR(512) DEFAULT NULL COMMENT '故障视频URL',
    urgency VARCHAR(16) DEFAULT 'normal' COMMENT '紧急程度: normal/urgent/emergency',
    service_type VARCHAR(16) DEFAULT 'onsite' COMMENT '期望服务方式: onsite-上门/instore-到店/mail-寄修',
    expected_time VARCHAR(64) DEFAULT NULL COMMENT '期望时间',
    status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT '工单状态',
    assignee_openid VARCHAR(64) DEFAULT NULL COMMENT '当前处理人openid',
    acceptor_openid VARCHAR(64) DEFAULT NULL COMMENT '受理客服openid',
    engineer_openid VARCHAR(64) DEFAULT NULL COMMENT '工程师openid',
    inspector_openid VARCHAR(64) DEFAULT NULL COMMENT '质检员openid',
    related_order_no VARCHAR(32) DEFAULT NULL COMMENT '关联旧工单号（质保报修时关联）',
    cancel_reason VARCHAR(512) DEFAULT NULL COMMENT '取消原因',
    modify_records JSON DEFAULT NULL COMMENT '修改记录数组',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_customer_openid (customer_openid),
    INDEX idx_status (status),
    INDEX idx_engineer_openid (engineer_openid),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='维修工单表';

-- 3. 创建检测报告表
CREATE TABLE IF NOT EXISTS inspection_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    report_no VARCHAR(32) NOT NULL UNIQUE COMMENT '报告编号',
    order_id BIGINT NOT NULL COMMENT '关联工单ID',
    order_no VARCHAR(32) NOT NULL COMMENT '关联工单号',
    engineer_openid VARCHAR(64) NOT NULL COMMENT '检测工程师openid',
    engineer_name VARCHAR(64) DEFAULT NULL COMMENT '工程师姓名',
    start_time DATETIME DEFAULT NULL COMMENT '检测开始时间',
    end_time DATETIME DEFAULT NULL COMMENT '检测结束时间',
    main_cause VARCHAR(512) DEFAULT NULL COMMENT '主因',
    secondary_cause VARCHAR(512) DEFAULT NULL COMMENT '次因（可选）',
    fault_category VARCHAR(32) DEFAULT NULL COMMENT '故障分类: 电气故障/机械故障/软件故障/老化损耗/人为损坏/其他',
    inspection_items JSON DEFAULT NULL COMMENT '检测项清单 [{item, status, description, photoUrl}]',
    repair_scheme TEXT COMMENT '维修方案描述',
    estimated_hours DECIMAL(5,1) DEFAULT NULL COMMENT '预估工时',
    parts_needed JSON DEFAULT NULL COMMENT '配件需求 [{name, quantity, unitPrice, inStock}]',
    estimated_cost_parts DECIMAL(10,2) DEFAULT NULL COMMENT '预估配件费',
    estimated_cost_labor DECIMAL(10,2) DEFAULT NULL COMMENT '预估人工费',
    estimated_cost_visit DECIMAL(10,2) DEFAULT NULL COMMENT '预估上门费',
    scheme_confirmed TINYINT DEFAULT 0 COMMENT '方案是否已确认: 0-否 1-是',
    inspection_photos JSON DEFAULT NULL COMMENT '检测照片URL数组',
    inspection_video VARCHAR(512) DEFAULT NULL COMMENT '检测视频URL',
    customer_signature VARCHAR(512) DEFAULT NULL COMMENT '客户电子签名图片URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检测报告表';

-- 4. 创建报价单表
CREATE TABLE IF NOT EXISTS quotation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    quotation_no VARCHAR(32) NOT NULL UNIQUE COMMENT '报价编号',
    order_id BIGINT NOT NULL COMMENT '关联工单ID',
    order_no VARCHAR(32) NOT NULL COMMENT '关联工单号',
    quotation_type VARCHAR(16) DEFAULT 'initial' COMMENT '报价类型: initial-初始报价/supplement-补充报价',
    fee_items JSON NOT NULL COMMENT '费用明细 [{type, name, quantity, unitPrice, subtotal}]',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '合计金额',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠/折扣金额',
    discount_reason VARCHAR(256) DEFAULT NULL COMMENT '优惠原因',
    actual_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    status VARCHAR(16) DEFAULT 'pending' COMMENT '报价状态: pending-待确认/confirmed-已确认/rejected-已拒绝/negotiating-协商中',
    customer_confirmed_at DATETIME DEFAULT NULL COMMENT '客户确认时间',
    revision_records JSON DEFAULT NULL COMMENT '修订记录 [{time, beforeAmount, afterAmount, reason}]',
    payment_status VARCHAR(16) DEFAULT 'unpaid' COMMENT '收款状态: unpaid-未收款/paid-已收款',
    payment_method VARCHAR(32) DEFAULT NULL COMMENT '收款方式: cash/wechat_transfer/bank_transfer/other',
    payment_time DATETIME DEFAULT NULL COMMENT '收款时间',
    payment_confirmer VARCHAR(64) DEFAULT NULL COMMENT '收款确认人openid',
    supplement_reason VARCHAR(512) DEFAULT NULL COMMENT '补充报价原因',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报价单表';

-- 5. 创建维修过程记录表
CREATE TABLE IF NOT EXISTS repair_process (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '关联工单ID',
    order_no VARCHAR(32) NOT NULL COMMENT '关联工单号',
    engineer_openid VARCHAR(64) NOT NULL COMMENT '维修工程师openid',
    engineer_name VARCHAR(64) DEFAULT NULL COMMENT '工程师姓名',
    start_time DATETIME DEFAULT NULL COMMENT '维修开始时间',
    end_time DATETIME DEFAULT NULL COMMENT '维修结束时间',
    step_records JSON DEFAULT NULL COMMENT '维修步骤记录 [{time, description, photos, status}]',
    parts_replaced JSON DEFAULT NULL COMMENT '配件更换记录 [{oldPart, newPart, quantity, recycled, photos}]',
    actual_hours DECIMAL(5,1) DEFAULT NULL COMMENT '实际工时',
    repair_result VARCHAR(16) DEFAULT NULL COMMENT '维修结果: fixed-已修复/partial-部分修复/unrepairable-无法修复',
    repair_remark TEXT COMMENT '维修备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='维修过程记录表';

-- 6. 创建质检报告表
CREATE TABLE IF NOT EXISTS quality_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '关联工单ID',
    order_no VARCHAR(32) NOT NULL COMMENT '关联工单号',
    inspector_openid VARCHAR(64) NOT NULL COMMENT '质检员openid',
    inspector_name VARCHAR(64) DEFAULT NULL COMMENT '质检员姓名',
    inspection_time DATETIME DEFAULT NULL COMMENT '质检时间',
    check_items JSON DEFAULT NULL COMMENT '质检项清单 [{item, standard, result, remark}]',
    conclusion VARCHAR(16) NOT NULL COMMENT '质检结论: pass-合格/fail-不合格',
    fail_reason VARCHAR(512) DEFAULT NULL COMMENT '不合格原因',
    test_photos JSON DEFAULT NULL COMMENT '测试照片URL数组',
    test_video VARCHAR(512) DEFAULT NULL COMMENT '测试视频URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='质检报告表';

-- 7. 创建交付凭证表
CREATE TABLE IF NOT EXISTS delivery_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '关联工单ID',
    order_no VARCHAR(32) NOT NULL COMMENT '关联工单号',
    delivery_time DATETIME DEFAULT NULL COMMENT '交付时间',
    customer_signature VARCHAR(512) DEFAULT NULL COMMENT '客户电子签名图片URL',
    customer_rating TINYINT DEFAULT NULL COMMENT '客户评分1-5',
    customer_review TEXT COMMENT '客户评价文字',
    warranty_days INT DEFAULT 90 COMMENT '质保天数',
    warranty_start DATE DEFAULT NULL COMMENT '质保起始日',
    warranty_end DATE DEFAULT NULL COMMENT '质保截止日',
    warranty_scope TEXT COMMENT '质保范围描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_order_id (order_id),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交付凭证表';

-- 8. 创建售后记录表
CREATE TABLE IF NOT EXISTS after_sale_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    order_id BIGINT NOT NULL COMMENT '关联工单ID',
    order_no VARCHAR(32) NOT NULL COMMENT '关联工单号',
    visit_records JSON DEFAULT NULL COMMENT '回访记录 [{time, method, content, satisfaction}]',
    warranty_repairs JSON DEFAULT NULL COMMENT '质保报修 [{repairTime, description, isWarranty, newOrderNo, result}]',
    customer_feedback TEXT COMMENT '客户反馈文字',
    customer_rating TINYINT DEFAULT NULL COMMENT '客户评分',
    renewal_recommended TINYINT DEFAULT 0 COMMENT '续保推荐: 0-否 1-是',
    status VARCHAR(16) DEFAULT 'tracking' COMMENT '售后状态: tracking-跟踪中/closed-已关闭',
    close_time DATETIME DEFAULT NULL COMMENT '关闭时间',
    close_type VARCHAR(16) DEFAULT NULL COMMENT '关闭方式: auto-自动关闭/manual-客服手动关闭',
    closed_by VARCHAR(64) DEFAULT NULL COMMENT '关闭人openid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='售后记录表';

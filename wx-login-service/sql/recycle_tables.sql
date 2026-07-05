-- ============================================================
-- GPU算力硬件回收模块 建表SQL
-- 数据库: wx_login
-- 创建时间: 2025
-- ============================================================

-- 1. 回收品类表
CREATE TABLE IF NOT EXISTS `recycle_category` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL COMMENT '品类名称',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '品类编码: gpu_server/gpu_card/cpu/memory/storage',
  `icon` VARCHAR(20) COMMENT '品类图标(emoji)',
  `description` VARCHAR(200) COMMENT '品类描述',
  `color` VARCHAR(20) DEFAULT '#2BB673' COMMENT '品类主题色',
  `has_config` TINYINT(1) DEFAULT 0 COMMENT '是否需要配置详情(0否 1是，仅服务器整机)',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='回收品类表';

-- 2. 回收型号表
CREATE TABLE IF NOT EXISTS `recycle_model` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `category_id` BIGINT NOT NULL COMMENT '所属品类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '型号名称',
  `brand` VARCHAR(50) NOT NULL COMMENT '品牌: NVIDIA/AMD/Intel/其他',
  `spec` VARCHAR(200) COMMENT '规格参数',
  `base_price` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '基础回收价(元)',
  `is_hot` TINYINT(1) DEFAULT 0 COMMENT '是否热门',
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category_id`),
  INDEX `idx_brand` (`brand`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='回收型号表';

-- 3. 估价规则表
CREATE TABLE IF NOT EXISTS `recycle_price_rule` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `model_id` BIGINT NOT NULL COMMENT '型号ID',
  `condition_factors` JSON COMMENT '成色系数: {"brand_new":1.0,"95":0.9,"90":0.8,"85":0.7,"80":0.6,"faulty":0.3}',
  `config_adjustments` JSON COMMENT '配置加价(仅服务器): {"cpu":{},"memory":{},"storage":{}}',
  `market_factor` DECIMAL(3,2) DEFAULT 1.00 COMMENT '市场调价系数(0.80~1.20)',
  `min_price` DECIMAL(12,2) COMMENT '最低回收价(保护价)',
  `enabled` TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_model` (`model_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='估价规则表';

-- 4. 回收订单表
CREATE TABLE IF NOT EXISTS `recycle_order` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号(RC开头)',
  `user_openid` VARCHAR(64) NOT NULL COMMENT '用户openid',
  `category_id` BIGINT COMMENT '品类ID',
  `category_name` VARCHAR(50) COMMENT '品类名称',
  `model_id` BIGINT COMMENT '型号ID',
  `model_name` VARCHAR(100) COMMENT '型号名称',
  `model_spec` VARCHAR(200) COMMENT '型号规格',
  `condition_level` VARCHAR(20) COMMENT '成色等级: brand_new/95/90/85/80/faulty',
  `device_config` JSON COMMENT '设备配置(仅服务器): {"cpu":"","memory":"","storage":""}',
  `images` JSON COMMENT '设备照片URL数组',
  `estimated_price` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '预估回收价',
  `inspection_price` DECIMAL(12,2) COMMENT '验机报价',
  `final_price` DECIMAL(12,2) COMMENT '最终成交价',
  `recycle_method` VARCHAR(20) NOT NULL COMMENT '回收方式: onsite/mail/instore',
  `contact_name` VARCHAR(50) NOT NULL COMMENT '联系人',
  `contact_phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `address` VARCHAR(500) COMMENT '上门地址',
  `appointment_time` VARCHAR(100) COMMENT '预约时间',
  `store` VARCHAR(100) COMMENT '回收网点',
  `remark` VARCHAR(500) COMMENT '备注',
  `status` VARCHAR(30) NOT NULL DEFAULT 'pending_inspection' COMMENT '订单状态',
  `engineer_openid` VARCHAR(64) COMMENT '验机工程师openid',
  `cancel_reason` VARCHAR(200) COMMENT '取消原因',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_user` (`user_openid`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='回收订单表';

-- 5. 验机报告表
CREATE TABLE IF NOT EXISTS `recycle_inspection` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
  `appearance` JSON COMMENT '外观检查: [{"name":"外壳","ok":true}]',
  `functions` JSON COMMENT '功能测试: [{"name":"开机自检","ok":true}]',
  `config_verify` JSON COMMENT '配置核实: [{"name":"型号","value":"A100"}]',
  `photos` JSON COMMENT '验机照片URL数组',
  `conclusion` TEXT COMMENT '验机结论',
  `passed` TINYINT(1) DEFAULT 1 COMMENT '是否通过',
  `inspector` VARCHAR(50) COMMENT '验机工程师',
  `inspector_openid` VARCHAR(64) COMMENT '验机工程师openid',
  `inspect_time` DATETIME COMMENT '验机时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='验机报告表';

-- 6. 协商记录表
CREATE TABLE IF NOT EXISTS `recycle_negotiation` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
  `sender` VARCHAR(20) NOT NULL COMMENT '发送方: user/service',
  `message` TEXT COMMENT '消息内容',
  `offer_price` DECIMAL(12,2) COMMENT '报价金额',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='协商记录表';

-- 7. 用户地址表
CREATE TABLE IF NOT EXISTS `recycle_address` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_openid` VARCHAR(64) NOT NULL COMMENT '用户openid',
  `name` VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `province` VARCHAR(50) COMMENT '省',
  `city` VARCHAR(50) COMMENT '市',
  `district` VARCHAR(50) COMMENT '区',
  `detail` VARCHAR(500) COMMENT '详细地址',
  `is_default` TINYINT(1) DEFAULT 0 COMMENT '是否默认地址',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户地址表';


-- ============================================================
-- 初始数据：回收品类
-- ============================================================
INSERT INTO `recycle_category` (`name`, `code`, `icon`, `description`, `color`, `has_config`, `sort_order`) VALUES
('GPU服务器', 'gpu_server', '🖥️', 'DGX/HGX/AI服务器整机', '#2BB673', 1, 1),
('GPU显卡', 'gpu_card', '🎮', 'A100/H100/V100等', '#4A90D9', 0, 2),
('CPU处理器', 'cpu', '⚙️', 'Xeon/EPYC服务器CPU', '#FF9500', 0, 3),
('内存', 'memory', '📊', 'DDR4/DDR5 ECC内存', '#AF52DE', 0, 4),
('存储设备', 'storage', '💾', 'NVMe SSD/HDD', '#FF3B30', 0, 5);

-- ============================================================
-- 初始数据：热门回收型号
-- ============================================================
INSERT INTO `recycle_model` (`category_id`, `name`, `brand`, `spec`, `base_price`, `is_hot`, `sort_order`) VALUES
-- GPU服务器
(1, 'NVIDIA DGX H100', 'NVIDIA', '8×H100 80GB / 640GB', 850000, 1, 1),
(1, 'NVIDIA DGX A100', 'NVIDIA', '8×A100 80GB / 640GB', 520000, 1, 2),
(1, 'HGX H200', 'NVIDIA', '8×H200 141GB', 1200000, 1, 3),
(1, 'AMD Instinct MI300X 服务器', 'AMD', '8×MI300X 192GB', 720000, 1, 4),
-- GPU显卡
(2, 'H100 SXM5 80GB', 'NVIDIA', '80GB HBM3 / 700W', 95000, 1, 1),
(2, 'H100 PCIe 80GB', 'NVIDIA', '80GB HBM3 / 350W', 78000, 1, 2),
(2, 'A100 SXM4 80GB', 'NVIDIA', '80GB HBM2e / 400W', 62000, 1, 3),
(2, 'A100 SXM4 40GB', 'NVIDIA', '40GB HBM2e / 400W', 42000, 0, 4),
(2, 'V100 SXM2 32GB', 'NVIDIA', '32GB HBM2 / 300W', 18000, 0, 5),
(2, 'L40S 48GB', 'NVIDIA', '48GB GDDR6 / 350W', 38000, 1, 6),
(2, 'AMD MI300X 192GB', 'AMD', '192GB HBM3 / 750W', 88000, 1, 7),
(2, 'AMD MI250X 128GB', 'AMD', '128GB HBM2e / 560W', 35000, 0, 8),
-- CPU
(3, 'AMD EPYC 9654', 'AMD', '96核/192线程 / Genoa', 38000, 1, 1),
(3, 'AMD EPYC 9554', 'AMD', '64核/128线程 / Genoa', 22000, 0, 2),
(3, 'Intel Xeon 8480', 'Intel', '56核/112线程 / Sapphire Rapids', 28000, 1, 3),
(3, 'Intel Xeon 8380', 'Intel', '40核/80线程 / Ice Lake', 12000, 0, 4),
-- 内存
(4, 'DDR5 64GB ECC RDIMM', '其他', 'DDR5-4800 / 64GB', 2200, 0, 1),
(4, 'DDR4 64GB ECC LRDIMM', '其他', 'DDR4-3200 / 64GB', 1200, 1, 2),
(4, 'DDR4 32GB ECC RDIMM', '其他', 'DDR4-3200 / 32GB', 550, 0, 3),
-- 存储
(5, 'NVMe SSD 8TB', '其他', 'U.2 / PCIe 4.0 / 8TB', 6800, 1, 1),
(5, 'NVMe SSD 4TB', '其他', 'U.2 / PCIe 4.0 / 4TB', 3500, 0, 2),
(5, 'SAS HDD 12TB', '其他', '12Gbps / 7200rpm / 12TB', 1200, 0, 3);

-- ============================================================
-- 初始数据：估价规则（为每个型号设置成色系数和市场调价系数）
-- ============================================================
INSERT INTO `recycle_price_rule` (`model_id`, `condition_factors`, `config_adjustments`, `market_factor`, `min_price`, `enabled`)
SELECT
  m.id,
  '{"brand_new":1.0,"95":0.9,"90":0.8,"85":0.7,"80":0.6,"faulty":0.3}',
  CASE WHEN m.category_id = 1
    THEN '{"cpu":{"epyc_9654":5000,"epyc_9554":3000,"xeon_8480":4000,"xeon_8380":2000,"dual_epyc":10000},"memory":{"1tb":8000,"2tb":16000,"512g":4000,"256g":1500},"storage":{"nvme_16t":12000,"nvme_8t":6000,"nvme_4t":3000,"hdd_60t":5000}}'
    ELSE NULL
  END,
  1.00,
  m.base_price * 0.3,
  1
FROM `recycle_model` m;

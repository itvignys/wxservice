-- ============================================
-- GPU智修专家 - 数据库初始化脚本
-- 执行前请确保已连接到 gpu 数据库
-- ============================================

-- 创建用户表
CREATE TABLE IF NOT EXISTS wx_user (
                                       id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
                                       openid VARCHAR(64) NOT NULL UNIQUE COMMENT '微信openid',
    session_key VARCHAR(128) COMMENT '会话密钥',
    unionid VARCHAR(64) COMMENT 'UnionId',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_openid (openid)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='微信小程序用户表';

-- 1. 扩展 wx_user 表，新增用户资料字段
ALTER TABLE wx_user 
  ADD COLUMN nickname VARCHAR(64) DEFAULT NULL COMMENT '用户昵称' AFTER unionid,
  ADD COLUMN avatar_url VARCHAR(512) DEFAULT NULL COMMENT '头像URL' AFTER nickname,
  ADD COLUMN phone VARCHAR(20) DEFAULT NULL COMMENT '手机号' AFTER avatar_url,
  ADD COLUMN service_level TINYINT DEFAULT 0 COMMENT '服务等级: 0-AI问答 1-专家咨询 2-上门服务' AFTER phone;

-- 2. 创建知识库表
CREATE TABLE IF NOT EXISTS gpu_knowledge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    category VARCHAR(32) NOT NULL COMMENT '问题分类',
    question VARCHAR(128) NOT NULL COMMENT '问题描述',
    causes TEXT NOT NULL COMMENT '常见原因',
    diagnosis TEXT NOT NULL COMMENT '排查方法',
    solution TEXT NOT NULL COMMENT '维修方案',
    difficulty VARCHAR(16) DEFAULT NULL COMMENT '难度评估',
    cost VARCHAR(16) DEFAULT NULL COMMENT '维修成本',
    success_rate VARCHAR(16) DEFAULT NULL COMMENT '成功率',
    sort_order INT DEFAULT 0 COMMENT '排序序号',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category (category),
    INDEX idx_question (question)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='GPU显卡维修知识库';

-- 3. 创建企业信息表
CREATE TABLE IF NOT EXISTS company_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    openid VARCHAR(64) NOT NULL COMMENT '关联用户openid',
    name VARCHAR(128) NOT NULL COMMENT '企业名称',
    credit_code VARCHAR(32) DEFAULT NULL COMMENT '统一社会信用代码',
    contact VARCHAR(32) NOT NULL COMMENT '联系人',
    phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    address VARCHAR(256) NOT NULL COMMENT '企业地址',
    remark VARCHAR(512) DEFAULT NULL COMMENT '备注',
    gpu_count VARCHAR(32) DEFAULT NULL COMMENT '显卡数量范围',
    services JSON DEFAULT NULL COMMENT '服务需求(JSON数组)',
    status VARCHAR(16) DEFAULT 'pending' COMMENT '状态: pending/approved/rejected',
    has_used_free_service TINYINT DEFAULT 0 COMMENT '是否已使用免费上门检测: 0-否 1-是',
    submit_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业信息表';

-- 4. 导入知识库初始数据（17条）
INSERT INTO gpu_knowledge (id, category, question, causes, diagnosis, solution, difficulty, cost, success_rate, sort_order) VALUES
(1, '显示类', '黑屏/无信号', '显卡供电不足、金手指氧化、核心虚焊、显存故障', '重新插拔显卡、清洁金手指、检查供电线', '加焊核心、更换显存、重做BGA', '★★★', '中高', '70-85%', 1),
(2, '显示类', '花屏/条纹/色块', '显存损坏、核心故障、显存供电异常', '显存测试软件（MATS）检测坏块', '更换损坏显存芯片、修复供电电路', '★★★', '中', '80-90%', 2),
(3, '显示类', '分辨率异常/无法调节', 'EDID信息损坏、BIOS故障、驱动问题', '检查显示设置、重装驱动', '重写BIOS、修复EDID芯片', '★★', '中', '85-90%', 3),
(4, '驱动类', '设备管理器代码43', '显存虚焊/损坏、核心故障、BIOS问题', '显卡测试软件跑显存测试', '加焊/更换显存、重写BIOS', '★★★', '中', '75-85%', 4),
(5, '驱动类', '驱动安装失败/蓝屏', '系统兼容性、显卡硬件故障、旧驱动残留', '安全模式卸载驱动、DDU清理', '修复硬件故障后重装驱动', '★★', '低', '90%+', 5),
(6, '驱动类', '显卡不识别/黄色感叹号', 'PCIe插槽问题、显卡供电异常、BIOS损坏', '清洁插槽、检查供电', '重写BIOS、修复供电', '★★', '中', '80-85%', 6),
(7, '供电与过热', '显卡风扇不转/异响', '风扇轴承损坏、温控策略、风扇供电故障', '检查风扇供电、测试温控', '更换风扇、修复风扇供电电路', '★', '低', '95%+', 7),
(8, '供电与过热', '显卡温度过高/降频', '硅脂干涸、散热器积灰、导热垫老化', '测温、清洁散热器', '更换硅脂、清洁散热器、更换导热垫', '★', '低', '95%+', 8),
(9, '供电与过热', '显卡冒烟/烧毁', '供电短路、电容击穿、外接供电接反', '目检烧毁痕迹、测量阻值', '更换MOS管、电容、修复供电电路', '★★★★', '高', '<50%', 9),
(10, '物理与接口', '金手指烧坏/氧化', '插拔不当、氧化、PCIe插槽短路', '目检金手指状态', '清洁金手指、补焊金手指、更换金手指', '★★★', '中', '70-80%', 10),
(11, '物理与接口', '视频接口损坏', '频繁插拔、静电击穿、物理损伤', '测试各接口输出', '更换接口芯片、飞线修复', '★★★', '中', '75-85%', 11),
(12, '物理与接口', '显卡PCB弯折/断裂', '散热器过重、运输磕碰、安装不当', '目检PCB完整性', '层板修复、飞线修复断线', '★★★★★', '高', '40-60%', 12),
(13, '显存与核心', '显存报错/容量识别异常', '显存颗粒损坏、显存供电不稳', '显存测试软件逐个颗粒检测', '更换损坏显存颗粒', '★★★', '中', '80-90%', 13),
(14, '显存与核心', '核心虚焊/脱焊', '长期高温、热胀冷缩、摔落震动', '时亮时不亮、花屏、死机', 'BGA重新植球焊接', '★★★★', '中高', '70-85%', 14),
(15, '显存与核心', '核心烧毁/短路', '超频过度、供电异常、散热失效', '核心阻值异常、发热严重', '通常无法维修，需更换核心', '★★★★★', '高', '<30%', 15),
(16, 'BIOS与固件', 'BIOS损坏/刷错', '刷写中断、使用错误BIOS', '黑屏但风扇转、不识别显卡', '用编程器重新刷写BIOS、更换BIOS芯片', '★★', '中', '85-95%', 16),
(17, 'BIOS与固件', '矿卡后遗症', '长期高负载运行导致老化', '显存测试报错、不稳定', '更换老化元件、重做BGA', '★★★★', '中高', '50-70%', 17);

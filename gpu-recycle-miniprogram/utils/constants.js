// 回收订单状态枚举
const RECYCLE_STATUS = {
  PENDING_INSPECTION: 'pending_inspection',  // 待验机
  INSPECTING: 'inspecting',                   // 验机中
  PRICE_PENDING: 'price_pending',             // 待确认价格
  NEGOTIATING: 'negotiating',                 // 协商中
  PAYMENT_PENDING: 'payment_pending',         // 待打款
  COMPLETED: 'completed',                     // 已完成
  CANCELLED: 'cancelled'                      // 已取消
}

// 状态中文映射
const STATUS_TEXT = {
  [RECYCLE_STATUS.PENDING_INSPECTION]: '待验机',
  [RECYCLE_STATUS.INSPECTING]: '验机中',
  [RECYCLE_STATUS.PRICE_PENDING]: '待确认价格',
  [RECYCLE_STATUS.NEGOTIATING]: '协商中',
  [RECYCLE_STATUS.PAYMENT_PENDING]: '待打款',
  [RECYCLE_STATUS.COMPLETED]: '已完成',
  [RECYCLE_STATUS.CANCELLED]: '已取消'
}

// 状态颜色映射
const STATUS_COLOR = {
  [RECYCLE_STATUS.PENDING_INSPECTION]: '#FF9500',
  [RECYCLE_STATUS.INSPECTING]: '#4A90D9',
  [RECYCLE_STATUS.PRICE_PENDING]: '#FF9500',
  [RECYCLE_STATUS.NEGOTIATING]: '#FF3B30',
  [RECYCLE_STATUS.PAYMENT_PENDING]: '#2BB673',
  [RECYCLE_STATUS.COMPLETED]: '#34C759',
  [RECYCLE_STATUS.CANCELLED]: '#86868B'
}

// 订单状态流转时间轴节点
const STATUS_TIMELINE = [
  { status: RECYCLE_STATUS.PENDING_INSPECTION, label: '提交订单', icon: '📋' },
  { status: RECYCLE_STATUS.INSPECTING, label: '工程师验机', icon: '🔍' },
  { status: RECYCLE_STATUS.PRICE_PENDING, label: '确认价格', icon: '💰' },
  { status: RECYCLE_STATUS.PAYMENT_PENDING, label: '等待打款', icon: '🏦' },
  { status: RECYCLE_STATUS.COMPLETED, label: '回收完成', icon: '✅' }
]

// 成色等级
const CONDITION_LEVEL = {
  BRAND_NEW: 'brand_new',
  N95: '95',
  N90: '90',
  N85: '85',
  N80: '80',
  FAULTY: 'faulty'
}

const CONDITION_TEXT = {
  [CONDITION_LEVEL.BRAND_NEW]: '全新未拆封',
  [CONDITION_LEVEL.N95]: '95新',
  [CONDITION_LEVEL.N90]: '90新',
  [CONDITION_LEVEL.N85]: '85新',
  [CONDITION_LEVEL.N80]: '80新',
  [CONDITION_LEVEL.FAULTY]: '故障机'
}

// 成色系数（用于估价计算）
const CONDITION_FACTOR = {
  [CONDITION_LEVEL.BRAND_NEW]: 1.0,
  [CONDITION_LEVEL.N95]: 0.9,
  [CONDITION_LEVEL.N90]: 0.8,
  [CONDITION_LEVEL.N85]: 0.7,
  [CONDITION_LEVEL.N80]: 0.6,
  [CONDITION_LEVEL.FAULTY]: 0.3
}

// 成色说明
const CONDITION_DESC = {
  [CONDITION_LEVEL.BRAND_NEW]: '原封未拆，配件齐全，在保修期内',
  [CONDITION_LEVEL.N95]: '几乎全新，无使用痕迹，功能完全正常',
  [CONDITION_LEVEL.N90]: '轻微使用痕迹，功能完全正常',
  [CONDITION_LEVEL.N85]: '有少量划痕/磨损，功能完全正常',
  [CONDITION_LEVEL.N80]: '有明显使用痕迹，功能正常，可能缺配件',
  [CONDITION_LEVEL.FAULTY]: '存在故障/无法开机/部分功能异常，按配件回收'
}

// 回收方式
const RECYCLE_METHOD = {
  ONSITE: 'onsite',    // 上门回收
  MAIL: 'mail',         // 邮寄回收
  INSTORE: 'instore'    // 到店回收
}

const RECYCLE_METHOD_TEXT = {
  [RECYCLE_METHOD.ONSITE]: '上门回收',
  [RECYCLE_METHOD.MAIL]: '邮寄回收',
  [RECYCLE_METHOD.INSTORE]: '到店回收'
}

const RECYCLE_METHOD_DESC = {
  [RECYCLE_METHOD.ONSITE]: '工程师上门验机打款，适合大批量/高价值设备',
  [RECYCLE_METHOD.MAIL]: '顺丰到付寄至质检中心，收货后验机',
  [RECYCLE_METHOD.INSTORE]: '到指定回收网点当面验机交易'
}

const RECYCLE_METHOD_ICON = {
  [RECYCLE_METHOD.ONSITE]: '🚗',
  [RECYCLE_METHOD.MAIL]: '📦',
  [RECYCLE_METHOD.INSTORE]: '🏪'
}

// 回收品类
const CATEGORY = {
  GPU_SERVER: 'gpu_server',
  GPU_CARD: 'gpu_card',
  CPU: 'cpu',
  MEMORY: 'memory',
  STORAGE: 'storage'
}

const CATEGORY_TEXT = {
  [CATEGORY.GPU_SERVER]: 'GPU服务器',
  [CATEGORY.GPU_CARD]: 'GPU显卡',
  [CATEGORY.CPU]: 'CPU处理器',
  [CATEGORY.MEMORY]: '内存',
  [CATEGORY.STORAGE]: '存储设备'
}

const CATEGORY_ICON = {
  [CATEGORY.GPU_SERVER]: '🖥️',
  [CATEGORY.GPU_CARD]: '🎮',
  [CATEGORY.CPU]: '⚙️',
  [CATEGORY.MEMORY]: '芯片',
  [CATEGORY.STORAGE]: '💾'
}

// 品牌
const BRAND = {
  NVIDIA: 'NVIDIA',
  AMD: 'AMD',
  INTEL: 'Intel',
  OTHER: '其他'
}

module.exports = {
  RECYCLE_STATUS,
  STATUS_TEXT,
  STATUS_COLOR,
  STATUS_TIMELINE,
  CONDITION_LEVEL,
  CONDITION_TEXT,
  CONDITION_FACTOR,
  CONDITION_DESC,
  RECYCLE_METHOD,
  RECYCLE_METHOD_TEXT,
  RECYCLE_METHOD_DESC,
  RECYCLE_METHOD_ICON,
  CATEGORY,
  CATEGORY_TEXT,
  CATEGORY_ICON,
  BRAND
}

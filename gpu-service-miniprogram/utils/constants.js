// 工单状态枚举
const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  INSPECTING: 'inspecting',
  SCHEME_PENDING: 'scheme_pending',
  QUOTATION_PENDING: 'quotation_pending',
  WAITING_REPAIR: 'waiting_repair',
  REPAIRING: 'repairing',
  WAITING_INSPECTION: 'waiting_inspection',
  QUALITY_PASSED: 'quality_passed',
  DELIVERED: 'delivered',
  AFTER_SALE: 'after_sale',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
}

// 状态中文映射
const STATUS_TEXT = {
  [ORDER_STATUS.PENDING]: '待受理',
  [ORDER_STATUS.ACCEPTED]: '待检测',
  [ORDER_STATUS.INSPECTING]: '检测中',
  [ORDER_STATUS.SCHEME_PENDING]: '待确认方案',
  [ORDER_STATUS.QUOTATION_PENDING]: '待确认报价',
  [ORDER_STATUS.WAITING_REPAIR]: '待维修',
  [ORDER_STATUS.REPAIRING]: '维修中',
  [ORDER_STATUS.WAITING_INSPECTION]: '待质检',
  [ORDER_STATUS.QUALITY_PASSED]: '质检通过',
  [ORDER_STATUS.DELIVERED]: '已交付',
  [ORDER_STATUS.AFTER_SALE]: '售后中',
  [ORDER_STATUS.CLOSED]: '已关闭',
  [ORDER_STATUS.CANCELLED]: '已取消'
}

// 状态颜色映射
const STATUS_COLOR = {
  [ORDER_STATUS.PENDING]: '#ffd93d',
  [ORDER_STATUS.ACCEPTED]: '#4a90d9',
  [ORDER_STATUS.INSPECTING]: '#4a90d9',
  [ORDER_STATUS.SCHEME_PENDING]: '#ff6b6b',
  [ORDER_STATUS.QUOTATION_PENDING]: '#ff6b6b',
  [ORDER_STATUS.WAITING_REPAIR]: '#5d4e9c',
  [ORDER_STATUS.REPAIRING]: '#4a90d9',
  [ORDER_STATUS.WAITING_INSPECTION]: '#ffd93d',
  [ORDER_STATUS.QUALITY_PASSED]: '#51cf66',
  [ORDER_STATUS.DELIVERED]: '#51cf66',
  [ORDER_STATUS.AFTER_SALE]: '#4a90d9',
  [ORDER_STATUS.CLOSED]: '#a0a0a0',
  [ORDER_STATUS.CANCELLED]: '#a0a0a0'
}

// 用户角色
const USER_ROLE = {
  CUSTOMER: 'customer',
  SERVICE: 'service',
  ENGINEER: 'engineer',
  INSPECTOR: 'inspector',
  ADMIN: 'admin'
}

// 角色中文
const ROLE_TEXT = {
  [USER_ROLE.CUSTOMER]: '客户',
  [USER_ROLE.SERVICE]: '客服',
  [USER_ROLE.ENGINEER]: '工程师',
  [USER_ROLE.INSPECTOR]: '质检员',
  [USER_ROLE.ADMIN]: '管理员'
}

// 紧急程度
const URGENCY = {
  NORMAL: 'normal',
  URGENT: 'urgent',
  EMERGENCY: 'emergency'
}

const URGENCY_TEXT = {
  [URGENCY.NORMAL]: '普通',
  [URGENCY.URGENT]: '加急',
  [URGENCY.EMERGENCY]: '紧急'
}

// 服务方式
const SERVICE_TYPE = {
  ONSITE: 'onsite',
  INSTORE: 'instore',
  MAIL: 'mail'
}

const SERVICE_TYPE_TEXT = {
  [SERVICE_TYPE.ONSITE]: '上门',
  [SERVICE_TYPE.INSTORE]: '到店',
  [SERVICE_TYPE.MAIL]: '寄修'
}

// 故障分类
const FAULT_CATEGORIES = ['电气故障', '机械故障', '软件故障', '老化损耗', '人为损坏', '其他']

// 报价类型
const QUOTATION_TYPE = {
  NORMAL: 'normal',
  REVISION: 'revision',
  SUPPLEMENT: 'supplement'
}

const QUOTATION_TYPE_TEXT = {
  [QUOTATION_TYPE.NORMAL]: '正式报价',
  [QUOTATION_TYPE.REVISION]: '修订报价',
  [QUOTATION_TYPE.SUPPLEMENT]: '补充报价'
}

module.exports = {
  ORDER_STATUS,
  STATUS_TEXT,
  STATUS_COLOR,
  USER_ROLE,
  ROLE_TEXT,
  URGENCY,
  URGENCY_TEXT,
  SERVICE_TYPE,
  SERVICE_TYPE_TEXT,
  FAULT_CATEGORIES,
  QUOTATION_TYPE,
  QUOTATION_TYPE_TEXT
}

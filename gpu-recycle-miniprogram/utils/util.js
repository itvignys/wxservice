// 通用工具函数

/**
 * 价格格式化：分 → 元（保留整数，千分位）
 */
function formatPrice(cents) {
  if (cents == null) return '0'
  const yuan = Math.round(cents)
  return yuan.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 价格格式化为带￥符号
 */
function formatYuan(cents) {
  return '¥' + formatPrice(cents)
}

/**
 * 日期格式化 YYYY-MM-DD HH:mm
 */
function formatTime(date) {
  if (!date) return ''
  if (typeof date === 'string') date = new Date(date)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

/**
 * 日期格式化 YYYY-MM-DD
 */
function formatDate(date) {
  if (!date) return ''
  if (typeof date === 'string') date = new Date(date)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 防抖
 */
function debounce(fn, delay = 500) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 验证手机号
 */
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 生成订单号
 */
function generateOrderNo() {
  const now = new Date()
  const y = now.getFullYear()
  const m = (now.getMonth() + 1).toString().padStart(2, '0')
  const d = now.getDate().toString().padStart(2, '0')
  const h = now.getHours().toString().padStart(2, '0')
  const min = now.getMinutes().toString().padStart(2, '0')
  const s = now.getSeconds().toString().padStart(2, '0')
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `RC${y}${m}${d}${h}${min}${s}${rand}`
}

/**
 * 价格数字滚动动画（CountUp效果）
 * @param {Object} pageObj 页面对象(this)
 * @param {String} dataKey data中的key
 * @param {Number} target 目标值
 * @param {Number} duration 动画时长ms
 */
function countUp(pageObj, dataKey, target, duration = 800) {
  const start = pageObj.data[dataKey] || 0
  const startTime = Date.now()
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    // easeOutQuart
    const eased = 1 - Math.pow(1 - progress, 4)
    const current = Math.round(start + (target - start) * eased)
    pageObj.setData({ [dataKey]: current })
    if (progress < 1) {
      setTimeout(animate, 16)
    }
  }
  animate()
}

module.exports = {
  formatPrice,
  formatYuan,
  formatTime,
  formatDate,
  debounce,
  validatePhone,
  generateOrderNo,
  countUp
}

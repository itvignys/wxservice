const { formatPrice, formatTime } = require('../../../utils/util')
const { recycleOrderApi } = require('../../../utils/api')

Page({
  data: {
    orderNo: '',
    estimatedPriceText: '',
    inspectionPriceText: '',
    latestOfferText: '',
    messages: [],
    inputText: '',
    quickActions: ['验机报告有疑问', '能否提高报价？', '接受当前报价', '需要时间考虑']
  },

  onLoad(options) {
    this.setData({ orderNo: options.orderNo })
    this.loadNegotiation()
  },

  loadNegotiation() {
    // 加载订单信息
    const records = wx.getStorageSync('recycleRecords') || []
    const order = records.find(r => r.orderNo === this.data.orderNo)
    if (order) {
      const inspectionPrice = order.inspectionPrice || Math.round((order.estimatedPrice || 0) * 0.92)
      this.setData({
        estimatedPriceText: formatPrice(order.estimatedPrice || 0),
        inspectionPriceText: formatPrice(inspectionPrice),
        latestOfferText: formatPrice(inspectionPrice)
      })
    }

    recycleOrderApi.getNegotiations(this.data.orderNo).then((data) => {
      if (data && data.length > 0) {
        this.processMessages(data)
      } else {
        this.initMockMessages()
      }
    }).catch(() => {
      this.initMockMessages()
    })
  },

  initMockMessages() {
    const messages = [
      { fromUser: false, text: '您好，我是回收顾问，关于您的设备验机报价，有什么可以帮您？', time: Date.now() - 600000 }
    ]
    this.processMessages(messages)
  },

  processMessages(msgs) {
    const messages = msgs.map(m => ({
      ...m,
      priceText: m.price ? formatPrice(m.price) : '',
      timeText: formatTime(m.time)
    }))
    this.setData({ messages })
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  sendMsg() {
    const text = this.data.inputText.trim()
    if (!text) return

    const messages = [...this.data.messages, {
      fromUser: true,
      text,
      time: Date.now()
    }]
    this.setData({ inputText: '', messages: this.formatMsgs(messages) })

    // 发送到后端
    recycleOrderApi.sendNegotiation({ orderNo: this.data.orderNo, text }).catch(() => {})

    // 模拟客服回复
    setTimeout(() => {
      const reply = this.generateReply(text)
      const updated = [...this.data.messages, {
        fromUser: false,
        text: reply.text,
        price: reply.price,
        time: Date.now()
      }]
      this.setData({
        messages: this.formatMsgs(updated),
        latestOfferText: reply.price ? formatPrice(reply.price) : this.data.latestOfferText
      })
    }, 1500)
  },

  formatMsgs(msgs) {
    return msgs.map(m => ({
      ...m,
      priceText: m.price ? formatPrice(m.price) : '',
      timeText: formatTime(m.time)
    }))
  },

  generateReply(text) {
    if (text.includes('提高') || text.includes('加价') || text.includes('能否')) {
      const current = parseInt(this.data.latestOfferText.replace(/,/g, '')) || 0
      const newPrice = Math.round(current * 1.03)
      return { text: `理解您的诉求。结合设备实际状况和市场行情，我们可以将报价调整至 ¥${formatPrice(newPrice)}，这是我们能给出的最优价格了。`, price: newPrice }
    }
    if (text.includes('接受') || text.includes('同意') || text.includes('确认')) {
      return { text: '好的，感谢您的认可！将为您进入打款流程，请稍候。' }
    }
    if (text.includes('疑问') || text.includes('报告')) {
      return { text: '验机报告中的每一项检查都可以详细为您解释，请问您对哪一项有疑问？' }
    }
    return { text: '收到您的消息，我们会尽快为您处理。如有特殊需求也可以拨打客服热线 13826580396。' }
  },

  quickReply(e) {
    const action = e.currentTarget.dataset.action
    this.setData({ inputText: action })
    this.sendMsg()
  }
})

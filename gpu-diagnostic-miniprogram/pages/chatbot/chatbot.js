const app = getApp()
const api = require('../../utils/api.js')
const constants = require('../../utils/constants.js')
const knowledgeData = require('../../data/knowledge.js') // 保留作为离线兜底

Page({
  data: {
    messages: [],
    inputMessage: '',
    isLoading: false,
    scrollToView: '',
    serviceLevel: 0,
    companyInfo: null,
    keyboardHeight: 0,
    sessionId: '',
    quickSymptoms: [
      '显卡黑屏无信号',
      '屏幕花屏有条纹',
      '显卡温度过高',
      '驱动安装失败',
      '显存报错代码',
      'GPU风扇噪音大'
    ]
  },

  onLoad() {
    this.loadUserData()
    // 初始化会话ID
    const sessionId = this.generateSessionId()
    this.setData({ sessionId })
    // 检查是否有搜索关键词
    const keyword = wx.getStorageSync('searchKeyword')
    if (keyword) {
      this.sendQuickMessage({ currentTarget: { dataset: { text: keyword } } })
      wx.removeStorageSync('searchKeyword')
    }
    setTimeout(() => { this.scrollToBottom() }, 300)
  },

  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
  },

  onShow() {
    this.loadUserData()
  },

  loadUserData() {
    const companyInfo = app.globalData.companyInfo || wx.getStorageSync(constants.STORAGE_KEYS.COMPANY_INFO)
    const serviceLevel = app.globalData.serviceLevel || wx.getStorageSync(constants.STORAGE_KEYS.SERVICE_LEVEL) || 0
    this.setData({ companyInfo, serviceLevel })
  },

  onInput(e) {
    this.setData({ inputMessage: e.detail.value })
  },

  onKeyboardHeightChange(e) {
    if (e.detail.height > 0) {
      setTimeout(() => { this.scrollToBottom() }, 300)
    }
  },

  scrollToBottom() {
    this.setData({ scrollToView: 'scroll-bottom' })
  },

  // 发送消息
  sendMessage() {
    const message = this.data.inputMessage.trim()
    if (!message) return

    this.addMessage('user', 'text', message)
    this.setData({ inputMessage: '' })
    this.processMessage(message)
  },

  // 快速发送
  sendQuickMessage(e) {
    const text = e.currentTarget.dataset.text
    this.addMessage('user', 'text', text)
    this.processMessage(text)
  },

  // 添加消息
  addMessage(type, contentType, content, extra = {}) {
    const message = {
      id: Date.now(),
      type,
      contentType,
      content,
      time: new Date().toLocaleTimeString(),
      ...extra
    }
    
    const messages = this.data.messages.concat(message)
    this.setData({ messages }, () => { this.scrollToBottom() })
  },

  scrollToBottom() {
    const lastMsg = this.data.messages[this.data.messages.length - 1]
    if (lastMsg) {
      this.setData({ scrollToView: `msg-${lastMsg.id}` })
    }
  },

  onInputFocus() {
    setTimeout(() => { this.scrollToBottom() }, 300)
  },

  onInputBlur() {
    this.setData({ keyboardHeight: 0 })
  },

  // ========== 核心消息处理逻辑 ==========
  
  async processMessage(message) {
    this.setData({ isLoading: true })

    // 1. 先在本地知识库搜索（快速响应）
    const knowledgeResult = this.searchKnowledgeBase(message)

    if (knowledgeResult && knowledgeResult.score >= 60) {
      // 知识库匹配度高，直接返回知识库回复
      await new Promise(resolve => setTimeout(resolve, 500)) // 短暂延迟让UI更自然
      this.setData({ isLoading: false })

      const reply = this.generateKnowledgeReply(knowledgeResult)
      this.addMessage('ai', 'text', reply, {
        knowledgeMatch: knowledgeResult.item,
        matchScore: knowledgeResult.score,
        showUpgrade: true,
        source: 'knowledge' // 标记来源为知识库
      })
    } else {
      // 2. 知识库无高匹配 -> 调用元宝AI接口（RAG增强）
      try {
        const context = this.getChatContext()
        const result = await api.sendAiChat(message, context, this.data.sessionId)
        
        this.setData({ isLoading: false })
        this.addMessage('ai', 'text', result.data.reply, {
          isYuanbao: true,
          showUpgrade: true,
          source: 'yuanbao',
          convId: result.data.convId // 后端返回的对话记录ID，用于反馈
        })
      } catch (error) {
        console.error('AI调用失败:', error)
        this.setData({ isLoading: false })
        // AI调用失败的友好提示
        this.addMessage('ai', 'text', `抱歉，AI服务暂时不可用。您的问题"${message}"可能涉及以下方面：\n\n• 硬件连接问题（供电线、PCIe插槽）\n• 驱动程序异常\n• 显卡散热不良\n• 显存或核心故障\n\n建议：\n- 重新插拔显卡并清洁金手指\n- 更新显卡驱动程序\n- 或点击下方"联系专家"获取免费咨询服务。`, {
          showUpgrade: true,
          source: 'fallback'
        })
      }
    }
  },

  // 搜索知识库（本地搜索保持不变，作为快速匹配层）
  searchKnowledgeBase(keyword) {
    const list = knowledgeData.knowledgeList
    let bestMatch = null
    let maxScore = 0

    list.forEach(item => {
      let score = 0
      const keywordLower = keyword.toLowerCase()
      const questionLower = item.question.toLowerCase()
      const causesLower = item.causes.toLowerCase()

      if (questionLower.includes(keywordLower)) score += 50
      if (causesLower.includes(keywordLower)) score += 30
      
      const keywords = keywordLower.split(/[\/\s,，]/).filter(k => k.length >= 2)
      keywords.forEach(k => {
        if (questionLower.includes(k)) score += 10
        if (causesLower.includes(k)) score += 5
      })

      if (score > maxScore) {
        maxScore = score
        bestMatch = item
      }
    })

    return bestMatch ? { item: bestMatch, score: maxScore } : null
  },

  generateKnowledgeReply(result) {
    const item = result.item
    return `根据您描述的现象，我为您找到高度匹配的解决方案：\n\n「${item.question}」\n\n📋 常见原因：${item.causes}\n\n🔍 排查方法：${item.diagnosis}\n\n🛠️ 维修方案：${item.solution}\n\n⭐ 难度：${item.difficulty} | 💰 成本：${item.cost} | ✅ 成功率：${item.successRate}\n\n如需进一步诊断，可以继续描述问题或联系我们的专家。`
  },

  // 获取对话上下文（保留最近5轮文字对话，过滤掉图片路径）
  getChatContext() {
    const messages = this.data.messages
    const context = []
    let count = 0
    
    for (let i = messages.length - 1; i >= 0 && count < 10; i--) {
      const msg = messages[i]
      // 只收集 user 和 ai 的文本消息，跳过图片等本地路径消息
      if ((msg.type === 'user' || msg.type === 'ai') && msg.contentType !== 'image') {
        context.unshift({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })
        count++
      }
    }
    
    return context
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.addMessage('user', 'image', tempFilePath)
        this.analyzeImage(tempFilePath)
      }
    })
  },

  // 分析图片（对接元宝AI Vision多模态）
  async analyzeImage(imagePath) {
    this.setData({ isLoading: true })
    try {
      const fs = wx.getFileSystemManager()
      const base64 = fs.readFileSync(imagePath, 'base64')
      const mime = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg'
      const imageBase64 = `data:${mime};base64,${base64}`
      const context = this.getChatContext()
      const result = await api.sendAiImageChat('请分析这张图片中的显卡故障', imageBase64, context)

      this.setData({ isLoading: false })
      this.addMessage('ai', 'text', result.data.reply, {
        isYuanbao: true,
        showUpgrade: true,
        source: 'yuanbao',
        convId: result.data.convId
      })
    } catch (error) {
      console.error('图片分析失败:', error)
      this.setData({ isLoading: false })
      this.addMessage('ai', 'text', '图片分析服务暂时不可用，请稍后重试，或直接描述您遇到的问题。', {
        showUpgrade: true,
        source: 'fallback'
      })
    }
  },

  previewImage(e) {
    wx.previewImage({ urls: [e.currentTarget.dataset.url] })
  },

  // 点击元宝AI解答标签，重新调用AI接口深入回答
  async onYuanbaoClick(e) {
    const msgId = Number(e.currentTarget.dataset.id)
    const messages = this.data.messages
    const msgIndex = messages.findIndex(m => m.id === msgId)
    if (msgIndex === -1) {
      console.warn('onYuanbaoClick: 未找到消息, msgId=', msgId)
      return
    }

    // 向上查找最近的用户问题
    let userMessage = null
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].type === 'user') {
        userMessage = messages[i]
        break
      }
    }
    if (!userMessage) {
      wx.showToast({ title: '未找到对应问题', icon: 'none' })
      return
    }

    this.setData({ isLoading: true })
    try {
      const context = this.getChatContext()
      const result = await api.sendAiChat(
        `请更深入地分析这个问题：${userMessage.content}`,
        context,
        this.data.sessionId
      )
      this.setData({ isLoading: false })
      this.addMessage('ai', 'text', result.data.reply, {
        isYuanbao: true,
        showUpgrade: true,
        source: 'yuanbao',
        convId: result.data.convId
      })
    } catch (error) {
      console.error('元宝AI深入分析失败:', error)
      this.setData({ isLoading: false })
      wx.showToast({ title: 'AI调用失败，请稍后重试', icon: 'none' })
    }
  },

  // 用户对AI回答反馈（点赞/点踩）
  async onFeedback(e) {
    const { id, helpful } = e.currentTarget.dataset
    const messages = this.data.messages
    const idx = messages.findIndex(m => m.id === id)
    if (idx === -1) return

    const msg = messages[idx]
    if (!msg.convId) {
      wx.showToast({ title: '暂无可反馈的记录', icon: 'none' })
      return
    }

    try {
      await api.sendAiFeedback(msg.convId, helpful)
      // 本地标记已反馈，避免重复点击
      this.setData({
        [`messages[${idx}].feedback`]: helpful ? 'like' : 'dislike'
      })
      wx.showToast({ title: helpful ? '感谢点赞' : '已记录，我们会改进', icon: 'none' })
    } catch (err) {
      console.error('反馈提交失败:', err)
      wx.showToast({ title: '反馈失败，请重试', icon: 'none' })
    }
  },

  showKnowledgeBase() {
    wx.switchTab({ url: '/pages/knowledge/knowledge' })
  },

  contactExpert() {
    if (this.data.serviceLevel < 1) {
      app.upgradeServiceLevel(1)
      this.setData({ serviceLevel: 1 })
      this.addMessage('system', 'text', '已为您升级至专家咨询服务')
    }

    wx.showModal({
      title: '联系专家',
      content: '专家服务热线：13826580396\n服务时间：9:00-21:00（全年无休）',
      confirmText: '立即拨打',
      cancelText: '稍后再说',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '13826580396' })
        }
      }
    })
  },

  bookOnsite() {
    console.log('bookOnsite 被点击, companyInfo=', this.data.companyInfo)
    if (!this.data.companyInfo) {
      wx.showModal({
        title: '需要企业信息',
        content: '首次免费上门服务需要您提供真实的企业信息，是否立即填写？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/service/service' })
          }
        }
      })
      return
    }

    if (this.data.serviceLevel < 2) {
      const hasUsed = app.globalData.hasUsedFreeService || wx.getStorageSync(constants.STORAGE_KEYS.HAS_USED_FREE_SERVICE)
      if (hasUsed) {
        wx.showModal({
          title: '提示',
          content: '您已使用过免费上门检测服务，如需再次上门服务请联系客服咨询收费标准。',
          showCancel: false
        })
        return
      }

      wx.showModal({
        title: '预约上门检测',
        content: `您即将预约免费上门检测服务\n\n企业名称：${this.data.companyInfo.name}\n联系地址：${this.data.companyInfo.address}\n\n确认预约后，我们的工程师将在24小时内与您联系确认上门时间。`,
        confirmText: '确认预约',
        success: (res) => {
          if (res.confirm) {
            app.upgradeServiceLevel(2)
            app.globalData.hasUsedFreeService = true
            wx.setStorageSync(constants.STORAGE_KEYS.HAS_USED_FREE_SERVICE, true)
            this.setData({ serviceLevel: 2 })
            
            this.addMessage('system', 'text', '上门检测服务预约成功！我们的工程师将在24小时内与您联系。')
            
            wx.showToast({ title: '预约成功', icon: 'success' })
          }
        }
      })
    }
  }
})

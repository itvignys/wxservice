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
    ],
    // 语音输入
    isRecording: false,
    recordTime: 0,
    recordTimer: null,
    // 下拉刷新
    isRefreshing: false,
    hasMoreHistory: true,
    historyPage: 0,
    // 图片预览
    imageUrls: [],
    // 打字机效果
    typingMsgId: null,
    typingTimer: null
  },

  recorderManager: null,

  onLoad() {
    this.loadUserData()
    // 初始化会话ID：优先从Storage读取当前会话，无则生成新会话
    const sessionId = this.getOrCreateSessionId()
    this.setData({ sessionId })
    // 检查是否有搜索关键词
    const keyword = wx.getStorageSync('searchKeyword')
    if (keyword) {
      this.sendQuickMessage({ currentTarget: { dataset: { text: keyword } } })
      wx.removeStorageSync('searchKeyword')
    }
    // 加载本地历史消息
    this.loadLocalHistory()
    // 初始化录音管理器
    this.initRecorder()
    setTimeout(() => { this.scrollToBottom() }, 300)
  },

  // 获取或创建会话ID（持久化到Storage）
  getOrCreateSessionId() {
    let sid = wx.getStorageSync('currentSessionId')
    if (!sid) {
      sid = this.generateSessionId()
      wx.setStorageSync('currentSessionId', sid)
    }
    return sid
  },

  // 新建对话
  newChat() {
    wx.showModal({
      title: '新建对话',
      content: '开始新对话后，当前对话记录仍会保留在历史中',
      confirmText: '开始新对话',
      success: (res) => {
        if (res.confirm) {
          // 将当前会话归档到历史会话列表
          this.archiveCurrentSession()
          // 生成新会话
          const sessionId = this.generateSessionId()
          wx.setStorageSync('currentSessionId', sessionId)
          this.setData({
            sessionId,
            messages: [],
            inputMessage: '',
            imageUrls: [],
            isLoading: false
          })
          wx.showToast({ title: '新对话已创建', icon: 'success' })
        }
      }
    })
  },

  // 将当前会话归档到历史列表
  archiveCurrentSession() {
    try {
      const sessions = wx.getStorageSync('chatSessions') || []
      const currentMsgs = this.data.messages
      if (currentMsgs.length > 0) {
        const lastMsg = currentMsgs[currentMsgs.length - 1]
        sessions.unshift({
          sessionId: this.data.sessionId,
          lastMessage: lastMsg.contentType === 'text'
            ? (lastMsg.content.length > 20 ? lastMsg.content.substring(0, 20) + '...' : lastMsg.content)
            : '[图片]',
          lastTime: lastMsg.time,
          messageCount: currentMsgs.length,
          timestamp: Date.now()
        })
        // 最多保留20个历史会话
        if (sessions.length > 20) sessions.pop()
        wx.setStorageSync('chatSessions', sessions)
      }
    } catch (e) {
      console.warn('归档会话失败', e)
    }
  },

  onUnload() {
    if (this.data.recordTimer) clearInterval(this.data.recordTimer)
    if (this.data.typingTimer) clearInterval(this.data.typingTimer)
  },

  // ========== 打字机效果 ==========

  /**
   * 打字机效果添加消息
   * @param {string} type - 消息类型
   * @param {string} contentType - 内容类型
   * @param {string} fullText - 完整文本
   * @param {Object} extra - 额外参数
   */
  typewriterAddMessage(type, contentType, fullText, extra = {}) {
    // 清理之前的打字机
    if (this.data.typingTimer) {
      clearInterval(this.data.typingTimer)
    }

    const msgId = Date.now() + '_' + Math.random().toString(36).substring(2, 6)
    const message = {
      id: msgId,
      type,
      contentType,
      content: '',
      time: new Date().toLocaleTimeString(),
      isTyping: true,
      ...extra
    }

    const messages = this.data.messages.concat(message)
    this.setData({ messages, typingMsgId: msgId }, () => {
      this.scrollToBottom()
    })

    let index = 0
    const speed = 15 // 每15ms输出一个字符
    const chunkSize = 2 // 每次输出2个字符，兼顾流畅和速度

    const timer = setInterval(() => {
      index += chunkSize
      if (index >= fullText.length) {
        index = fullText.length
        clearInterval(timer)
      }

      const currentText = fullText.substring(0, index)
      const msgIdx = this.data.messages.findIndex(m => m.id === msgId)
      if (msgIdx === -1) {
        clearInterval(timer)
        return
      }

      const isDone = index >= fullText.length
      const updateKey = `messages[${msgIdx}]`
      this.setData({
        [`${updateKey}.content`]: currentText,
        [`${updateKey}.isTyping`]: !isDone,
        typingTimer: isDone ? null : timer
      }, () => {
        this.scrollToBottom()
        if (isDone) {
          this.saveMessages()
        }
      })
    }, speed)

    this.setData({ typingTimer: timer })
  },

  // 初始化录音管理器
  initRecorder() {
    this.recorderManager = wx.getRecorderManager()
    this.recorderManager.onStart(() => {
      console.log('录音开始')
      this.setData({ isRecording: true, recordTime: 0 })
      const timer = setInterval(() => {
        this.setData({ recordTime: this.data.recordTime + 1 })
        if (this.data.recordTime >= 60) {
          this.stopRecord()
        }
      }, 1000)
      this.setData({ recordTimer: timer })
    })
    this.recorderManager.onStop((res) => {
      console.log('录音结束', res)
      if (this.data.recordTimer) {
        clearInterval(this.data.recordTimer)
        this.setData({ recordTimer: null })
      }
      this.setData({ isRecording: false })
      if (res.duration > 1000) {
        this.handleVoiceMessage(res.tempFilePath, res.duration)
      } else {
        wx.showToast({ title: '录音时间太短', icon: 'none' })
      }
    })
    this.recorderManager.onError((err) => {
      console.error('录音错误', err)
      if (this.data.recordTimer) {
        clearInterval(this.data.recordTimer)
        this.setData({ recordTimer: null, isRecording: false })
      }
      wx.showToast({ title: '录音失败: ' + err.errMsg, icon: 'none' })
    })
  },

  // 开始录音
  startRecord() {
    if (!this.recorderManager) return
    this.recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    })
  },

  // 停止录音
  stopRecord() {
    if (!this.recorderManager) return
    this.recorderManager.stop()
  },

  // 处理语音消息
  async handleVoiceMessage(filePath, duration) {
    const durationSec = Math.ceil(duration / 1000)
    const tempMsgId = this.addMessage('user', 'voice', filePath, { duration: durationSec })
    this.setData({ isLoading: true })
    try {
      // 上传语音文件，获取持久化URL
      const uploadRes = await api.upload(filePath)
      const voiceUrl = constants.BASE_URL + uploadRes.data.url
      // 替换消息中的临时路径为持久化URL
      this.replaceMessageContent(tempMsgId, voiceUrl)
      // 语音消息提示AI分析
      const context = this.getChatContext()
      const result = await api.sendAiChat('用户发送了一段语音消息，请根据上下文理解用户可能的意图并给出帮助', context, this.data.sessionId)
      this.setData({ isLoading: false })
      this.addMessage('ai', 'text', result.data.reply, {
        isYuanbao: true,
        showUpgrade: true,
        source: 'yuanbao',
        convId: result.data.convId
      })
    } catch (error) {
      console.error('语音处理失败:', error)
      this.setData({ isLoading: false })
      this.addMessage('ai', 'text', '语音消息处理失败，请尝试用文字描述您的问题。', {
        showUpgrade: true,
        source: 'fallback'
      })
    }
  },

  // 替换指定消息的内容（用于将临时文件路径替换为持久化URL）
  replaceMessageContent(msgId, newContent) {
    const messages = this.data.messages.map(m => {
      if (m.id === msgId) {
        return { ...m, content: newContent }
      }
      return m
    })
    this.setData({ messages }, () => {
      this.saveMessages()
    })
  },

  // 播放语音
  playVoice(e) {
    const url = e.currentTarget.dataset.url
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = url
    innerAudioContext.play()
    innerAudioContext.onError((err) => {
      console.error('播放语音失败', err)
      wx.showToast({ title: '播放失败', icon: 'none' })
    })
  },

  // 加载本地历史消息
  loadLocalHistory() {
    try {
      const history = wx.getStorageSync('chatHistory_' + this.data.sessionId) || []
      if (history.length > 0) {
        this.setData({ messages: history })
        this.updateImageUrls()
      }
    } catch (e) {
      console.warn('加载历史消息失败', e)
    }
  },

  // 保存消息到本地（最多保留100条，防止超出Storage上限）
  saveMessages() {
    try {
      const MAX_MSG = 100
      let msgs = this.data.messages
      if (msgs.length > MAX_MSG) {
        msgs = msgs.slice(-MAX_MSG)
        // 静默截断，不提示用户
        console.log('消息数量超过' + MAX_MSG + '条，已自动截断早期消息')
      }
      wx.setStorageSync('chatHistory_' + this.data.sessionId, msgs)
    } catch (e) {
      console.warn('保存消息失败', e)
      // 如果是QuotaExceededError，尝试清理最早的消息再保存
      if (e && e.message && e.message.includes('quota')) {
        this.trimAndSaveMessages()
      }
    }
  },

  // 清理最早20%的消息后保存（Storage空间不足时降级）
  trimAndSaveMessages() {
    try {
      const msgs = this.data.messages.slice(Math.floor(this.data.messages.length * 0.2))
      wx.setStorageSync('chatHistory_' + this.data.sessionId, msgs)
      this.setData({ messages: msgs })
      console.log('Storage空间不足，已清理早期消息')
    } catch (e) {
      console.error('消息保存彻底失败', e)
    }
  },

  // 更新图片URL数组（用于预览）
  updateImageUrls() {
    const urls = this.data.messages
      .filter(m => m.type === 'user' && m.contentType === 'image')
      .map(m => m.content)
    this.setData({ imageUrls: urls })
  },

  // 下拉刷新加载更多历史消息
  onRefresh() {
    this.setData({ isRefreshing: true })
    // 目前仅支持本地历史，后续可对接后端分页接口
    setTimeout(() => {
      this.setData({ isRefreshing: false })
      wx.showToast({ title: '已是最新消息', icon: 'none' })
    }, 800)
  },

  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
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

  // 添加消息，返回消息ID以便后续操作（如替换临时路径）
  addMessage(type, contentType, content, extra = {}) {
    const message = {
      id: Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type,
      contentType,
      content,
      time: new Date().toLocaleTimeString(),
      ...extra
    }

    const messages = this.data.messages.concat(message)
    this.setData({ messages }, () => {
      this.scrollToBottom()
      this.saveMessages()
      if (type === 'user' && contentType === 'image') {
        this.updateImageUrls()
      }
    })
    return message.id
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
      // 知识库匹配度高，直接返回知识库回复（带打字机效果）
      await new Promise(resolve => setTimeout(resolve, 500))
      this.setData({ isLoading: false })

      const reply = this.generateKnowledgeReply(knowledgeResult)
      this.typewriterAddMessage('ai', 'text', reply, {
        knowledgeMatch: knowledgeResult.item,
        matchScore: knowledgeResult.score,
        showUpgrade: true,
        source: 'knowledge'
      })
    } else {
      // 2. 知识库无高匹配 -> 调用元宝AI接口（RAG增强）
      try {
        const context = this.getChatContext()
        const result = await api.sendAiChat(message, context, this.data.sessionId)

        this.setData({ isLoading: false })
        this.typewriterAddMessage('ai', 'text', result.data.reply, {
          isYuanbao: true,
          showUpgrade: true,
          source: 'yuanbao',
          convId: result.data.convId,
          ragSources: result.data.ragSources || []
        })
      } catch (error) {
        console.error('AI调用失败:', error)
        this.setData({ isLoading: false })
        // AI调用失败的友好提示（不使用打字机，直接显示）
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
        //  analyzeImage 内部会添加消息并处理上传，这里不再重复添加
        this.analyzeImage(tempFilePath)
      }
    })
  },

  // 分析图片（全链路：先上传后端获取URL，再送AI分析）
  async analyzeImage(imagePath) {
    this.setData({ isLoading: true })
    // 先添加用户图片消息（临时路径）
    const tempMsgId = this.addMessage('user', 'image', imagePath)
    try {
      // 步骤1：上传图片到后端，获取持久化URL
      const uploadRes = await api.upload(imagePath)
      const imageUrl = constants.BASE_URL + uploadRes.data.url

      // 替换消息中的临时路径为持久化URL
      this.replaceMessageContent(tempMsgId, imageUrl)
      // 更新图片预览列表
      this.updateImageUrls()

      // 步骤2：将图片URL发送给AI进行多模态分析
      const context = this.getChatContext()
      const result = await api.sendAiImageChat('请分析这张图片中的显卡故障', imageUrl, context)

      this.setData({ isLoading: false })
      this.typewriterAddMessage('ai', 'text', result.data.reply, {
        isYuanbao: true,
        showUpgrade: true,
        source: 'yuanbao',
        convId: result.data.convId,
        imageUrl: imageUrl,
        ragSources: result.data.ragSources || []
      })
    } catch (error) {
      console.error('图片分析失败:', error)
      this.setData({ isLoading: false })
      this.addMessage('ai', 'text', '图片上传或分析服务暂时不可用，请稍后重试，或直接描述您遇到的问题。', {
        showUpgrade: true,
        source: 'fallback'
      })
    }
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url
    const urls = this.data.imageUrls.length > 0 ? this.data.imageUrls : [url]
    wx.previewImage({ urls, current: url })
  },

  // ========== 长按消息操作菜单 ==========

  onMessageLongPress(e) {
    const { id, type, contenttype } = e.currentTarget.dataset
    const itemList = []
    if (contenttype === 'text') {
      itemList.push('复制')
    }
    itemList.push('删除')
    if (type === 'ai') {
      itemList.push('重新生成')
    }

    wx.showActionSheet({
      itemList,
      success: (res) => {
        const action = itemList[res.tapIndex]
        if (action === '复制') {
          this.copyMessage(id)
        } else if (action === '删除') {
          this.deleteMessage(id)
        } else if (action === '重新生成') {
          this.regenerateMessage(id)
        }
      }
    })
  },

  copyMessage(msgId) {
    const msg = this.data.messages.find(m => m.id === msgId)
    if (msg && msg.content) {
      wx.setClipboardData({
        data: msg.content,
        success: () => wx.showToast({ title: '已复制', icon: 'success' })
      })
    }
  },

  deleteMessage(msgId) {
    wx.showModal({
      title: '删除消息',
      content: '确定删除这条消息吗？',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          const messages = this.data.messages.filter(m => m.id !== msgId)
          this.setData({ messages }, () => {
            this.saveMessages()
            this.updateImageUrls()
          })
        }
      }
    })
  },

  async regenerateMessage(msgId) {
    const messages = this.data.messages
    const idx = messages.findIndex(m => m.id === msgId)
    if (idx === -1) return

    // 向上查找最近的用户问题
    let userMessage = null
    for (let i = idx - 1; i >= 0; i--) {
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
        `请重新回答这个问题（尝试给出不同角度或更详细的分析）：${userMessage.content}`,
        context,
        this.data.sessionId
      )
      this.setData({ isLoading: false })
      this.typewriterAddMessage('ai', 'text', result.data.reply, {
        isYuanbao: true,
        showUpgrade: true,
        source: 'yuanbao',
        convId: result.data.convId,
        ragSources: result.data.ragSources || []
      })
    } catch (error) {
      console.error('重新生成失败:', error)
      this.setData({ isLoading: false })
      wx.showToast({ title: '重新生成失败', icon: 'none' })
    }
  },

  // 点击元宝AI解答标签，重新调用AI接口深入回答
  async onYuanbaoClick(e) {
    const msgId = e.currentTarget.dataset.id
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
      this.typewriterAddMessage('ai', 'text', result.data.reply, {
        isYuanbao: true,
        showUpgrade: true,
        source: 'yuanbao',
        convId: result.data.convId,
        ragSources: result.data.ragSources || []
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

  async bookOnsite() {
    console.log('bookOnsite 被点击, companyInfo=', this.data.companyInfo)
    if (!this.data.companyInfo) {
      wx.showModal({
        title: '需要企业信息',
        content: '首次免费上门服务需要您提供真实的企业信息，是否立即填写？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/package-service/pages/service/service' })
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
        success: async (res) => {
          if (res.confirm) {
            const openid = app.globalData.userInfo ? app.globalData.userInfo.openid : null
            if (!openid) {
              wx.showToast({ title: '请先登录', icon: 'none' })
              return
            }

            try {
              // 创建维修工单
              await api.createOrder({
                customerOpenid: openid,
                customerName: this.data.companyInfo.contact || this.data.companyInfo.name,
                customerPhone: this.data.companyInfo.phone || '',
                customerAddress: this.data.companyInfo.address || '',
                deviceType: 'GPU显卡',
                brandModel: 'NVIDIA',
                faultDesc: '用户预约免费上门检测服务',
                urgency: 'normal',
                serviceType: 'onsite'
              })

              app.upgradeServiceLevel(2)
              app.globalData.hasUsedFreeService = true
              wx.setStorageSync(constants.STORAGE_KEYS.HAS_USED_FREE_SERVICE, true)
              this.setData({ serviceLevel: 2 })

              this.addMessage('system', 'text', '上门检测服务预约成功！工单已创建，我们的工程师将在24小时内与您联系。')
              wx.showToast({ title: '预约成功', icon: 'success' })
            } catch (err) {
              console.error('创建工单失败:', err)
              // 降级：本地预约
              app.upgradeServiceLevel(2)
              app.globalData.hasUsedFreeService = true
              wx.setStorageSync(constants.STORAGE_KEYS.HAS_USED_FREE_SERVICE, true)
              this.setData({ serviceLevel: 2 })
              this.addMessage('system', 'text', '上门检测服务预约成功（离线模式）！我们的工程师将在24小时内与您联系。')
              wx.showToast({ title: '预约成功', icon: 'success' })
            }
          }
        }
      })
    }
  }
})

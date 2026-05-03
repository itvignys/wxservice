const knowledgeData = require('../../data/knowledge.js')

Page({
  data: {
    messages: [],
    inputValue: '',
    scrollToMessage: '',
    showQuickQuestions: true,
    quickQuestions: [
      '黑屏无信号',
      '花屏条纹',
      '驱动安装失败',
      '显卡温度过高',
      '风扇不转',
      '代码43错误'
    ]
  },

  onLoad() {
    // 页面加载时可以做一些初始化
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  sendMessage() {
    const text = this.data.inputValue.trim()
    if (!text) return

    // 添加用户消息
    const userMessage = { type: 'user', text }
    const messages = [...this.data.messages, userMessage]
    
    this.setData({
      messages,
      inputValue: '',
      showQuickQuestions: false,
      scrollToMessage: `msg-${messages.length}`
    })

    // 模拟AI回复
    setTimeout(() => {
      this.aiReply(text)
    }, 800)
  },

  sendQuickQuestion(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ inputValue: text }, () => {
      this.sendMessage()
    })
  },

  aiReply(userText) {
    // 根据用户输入匹配知识库
    const matchedProblems = this.matchProblems(userText)
    
    let replyText = ''
    let recommendations = []
    let showUpgrade = false

    if (matchedProblems.length > 0) {
      const problem = matchedProblems[0]
      replyText = `根据您的描述，可能是以下问题：\n\n【${problem.title}】\n\n常见原因：${problem.causes}\n\n排查方法：${problem.diagnosis}\n\n维修方案：${problem.solution}\n\n维修难度：${'★'.repeat(problem.difficulty)}\n成功率：${problem.successRate}`
      
      // 添加相关推荐
      recommendations = matchedProblems.slice(1, 4).map(p => ({
        id: p.id,
        title: p.title,
        successRate: p.successRate,
        icon: this.getCategoryIcon(p.category)
      }))

      // 第3条消息后提示升级服务
      if (this.data.messages.length >= 5) {
        showUpgrade = true
      }
    } else {
      replyText = '抱歉，我暂时无法准确判断您的问题。建议您：\n\n1. 尝试使用更简单的关键词描述症状\n2. 查看知识库中的常见问题\n3. 联系人工专家获取专业帮助'
      showUpgrade = true
    }

    const aiMessage = {
      type: 'ai',
      text: replyText,
      recommendations,
      showUpgrade
    }

    const messages = [...this.data.messages, aiMessage]
    this.setData({
      messages,
      scrollToMessage: `msg-${messages.length}`
    })
  },

  matchProblems(text) {
    const keywords = text.toLowerCase().split(/[\s,，。！？]+/)
    const problems = knowledgeData.problems

    // 计算匹配度
    const scored = problems.map(problem => {
      let score = 0
      const searchFields = [
        problem.title,
        problem.symptoms.join(' '),
        problem.causes,
        problem.type
      ].join(' ').toLowerCase()

      keywords.forEach(keyword => {
        if (keyword.length >= 2) {
          if (searchFields.includes(keyword)) {
            score += 10
          }
          // 模糊匹配
          problem.symptoms.forEach(symptom => {
            if (symptom.includes(keyword) || keyword.includes(symptom)) {
              score += 5
            }
          })
        }
      })

      return { ...problem, score }
    })

    // 返回得分最高的3个
    return scored
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  },

  getCategoryIcon(category) {
    const icons = {
      display: '🖥️',
      driver: '🔧',
      power: '⚡',
      physical: '🔌',
      memory: '💾',
      bios: '💿'
    }
    return icons[category] || '🔧'
  },

  showQuickOptions() {
    this.setData({ showQuickQuestions: true })
  },

  goToKnowledgeDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/knowledge/detail/detail?id=${id}`
    })
  },

  goToExpert() {
    wx.navigateTo({ url: '/pages/expert/expert' })
  }
})

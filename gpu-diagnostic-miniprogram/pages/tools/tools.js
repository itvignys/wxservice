Page({
  data: {
    currentStep: 0,
    openFaq: null,
    tutorials: [
      {
        id: 1,
        title: '准备工作',
        brief: '检测前需要准备的软硬件环境',
        content: '1. 准备一台可以正常开机的电脑\n2. 确保显卡已正确安装在PCIe插槽\n3. 下载并安装对应型号的检测工具\n4. 关闭杀毒软件避免误报\n5. 准备好显卡型号信息（可在设备管理器查看）',
        tips: '建议在稳定的环境下进行检测，避免检测过程中断电或关机'
      },
      {
        id: 2,
        title: '运行检测程序',
        brief: '如何正确运行GPU检测工具',
        content: '1. 以管理员身份运行检测程序\n2. 选择对应的显卡型号（NVIDIA/AMD）\n3. 选择检测模式（快速/完整/压力测试）\n4. 点击开始检测按钮\n5. 等待检测完成（通常需要5-30分钟）',
        tips: '完整检测模式可以更准确地定位问题，但需要更长时间'
      },
      {
        id: 3,
        title: '查看检测报告',
        brief: '如何解读检测结果',
        content: '1. 查看总体健康评分\n2. 检查显存测试结果\n3. 查看核心温度记录\n4. 分析错误代码和日志\n5. 根据报告建议采取相应措施',
        tips: '检测报告会标注风险等级，红色警告需要立即处理'
      },
      {
        id: 4,
        title: '保存并分享',
        brief: '导出检测结果用于咨询',
        content: '1. 点击导出报告按钮\n2. 选择报告格式（PDF/HTML）\n3. 保存到本地或直接分享\n4. 如需专家诊断，可将报告发送给客服\n5. 保留原始日志文件以备后续分析',
        tips: '完整的报告可以帮助专家更准确地判断故障原因'
      }
    ],
    tools: [
      {
        id: 1,
        icon: '📊',
        name: 'GPU-Z',
        version: 'v2.57.0',
        type: 'free',
        typeName: '免费',
        description: '专业的显卡信息和监控工具，可查看显卡详细参数、温度、频率等实时数据。',
        features: ['硬件参数检测', '实时监控', '传感器数据', 'BIOS备份'],
        size: '8.5 MB',
        platform: 'Windows',
        downloading: false,
        progress: 0
      },
      {
        id: 2,
        icon: '🧪',
        name: 'FurMark',
        version: 'v1.35.0',
        type: 'free',
        typeName: '免费',
        description: 'OpenGL基准测试工具，通过毛皮渲染测试显卡稳定性和温度表现。',
        features: ['压力测试', '温度监控', '稳定性测试', '基准跑分'],
        size: '12.3 MB',
        platform: 'Windows',
        downloading: false,
        progress: 0
      },
      {
        id: 3,
        icon: '💾',
        name: 'MATS',
        version: 'v2.18.0',
        type: 'pro',
        typeName: '专业版',
        description: '显存测试工具，专门用于检测显卡显存是否存在坏块或故障。',
        features: ['显存坏块检测', '显存压力测试', '详细报告', '批量测试'],
        size: '5.2 MB',
        platform: 'Windows',
        downloading: false,
        progress: 0
      },
      {
        id: 4,
        icon: '⚡',
        name: 'OCCT',
        version: 'v12.1.0',
        type: 'free',
        typeName: '免费',
        description: '全面的系统稳定性测试工具，包含GPU 3D测试、显存测试等模块。',
        features: ['GPU 3D测试', '显存测试', '电源监控', '错误检测'],
        size: '25.6 MB',
        platform: 'Windows',
        downloading: false,
        progress: 0
      }
    ],
    faqs: [
      {
        id: 1,
        question: '检测工具会对显卡造成损伤吗？',
        answer: '正常使用检测工具不会对显卡造成损伤。压力测试会让显卡高负载运行，温度会升高，这是正常现象。建议确保散热良好，避免长时间超高温运行。'
      },
      {
        id: 2,
        question: '为什么检测结果显示正常但游戏还是会崩溃？',
        answer: '可能原因：1）驱动程序问题；2）游戏本身兼容性问题；3）系统或其他硬件问题；4）特定应用场景下的故障。建议更新驱动或联系专家进一步诊断。'
      },
      {
        id: 3,
        question: '检测工具支持苹果Mac电脑吗？',
        answer: '目前主要检测工具仅支持Windows系统。Mac用户可以使用系统自带的"系统信息"查看显卡信息，或使用第三方跨平台工具如Heaven Benchmark。'
      },
      {
        id: 4,
        question: '检测需要多长时间？',
        answer: '快速检测约5-10分钟，完整检测约20-30分钟，压力测试建议运行30分钟以上。显存测试根据容量不同，可能需要1-3小时。'
      }
    ]
  },

  // 展开/收起教程步骤
  toggleStep(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      currentStep: this.data.currentStep === index ? -1 : index
    })
  },

  // 下载工具
  downloadTool(e) {
    const id = e.currentTarget.dataset.id
    const tools = this.data.tools.map(tool => {
      if (tool.id === id) {
        return { ...tool, downloading: true, progress: 0 }
      }
      return tool
    })
    this.setData({ tools })

    // 模拟下载进度
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        
        // 下载完成
        const updatedTools = this.data.tools.map(tool => {
          if (tool.id === id) {
            return { ...tool, downloading: false, progress: 100 }
          }
          return tool
        })
        this.setData({ tools: updatedTools })
        
        wx.showToast({
          title: '下载完成',
          icon: 'success'
        })

        // 实际项目中这里会调用微信下载文件API
        // wx.downloadFile({
        //   url: 'https://example.com/tools/xxx.exe',
        //   success: (res) => {
        //     wx.openDocument({ filePath: res.tempFilePath })
        //   }
        // })
      } else {
        const updatedTools = this.data.tools.map(tool => {
          if (tool.id === id) {
            return { ...tool, progress: Math.floor(progress) }
          }
          return tool
        })
        this.setData({ tools: updatedTools })
      }
    }, 300)
  },

  // 展开/收起FAQ
  toggleFaq(e) {
    const id = e.currentTarget.dataset.id
    this.setData({
      openFaq: this.data.openFaq === id ? null : id
    })
  },

  // 跳转AI诊断
  goToChatbot() {
    wx.switchTab({
      url: '/pages/chatbot/chatbot'
    })
  }
})

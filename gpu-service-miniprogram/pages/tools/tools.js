Page({
  data: {
    tools: [
      {
        id: 'mats',
        name: 'MATS显存检测',
        version: 'v4.5.2',
        icon: '💾',
        type: 'free',
        typeText: '免费',
        description: '专业的NVIDIA显卡显存测试工具，可检测显存坏块、读写错误等问题，是维修显卡必备工具。',
        features: ['显存坏块检测', '读写错误扫描', '自动生成测试报告', '支持多代N卡'],
        downloadUrl: 'https://example.com/mats'
      },
      {
        id: 'cuda_memtest',
        name: 'CUDA MemTest',
        version: 'v2.1.0',
        icon: '🧪',
        type: 'free',
        typeText: '免费',
        description: '基于CUDA的显存压力测试工具，可长时间运行测试显存稳定性，适合检测隐性问题。',
        features: ['CUDA核心测试', '显存压力测试', '温度监控', '长时间稳定性测试'],
        downloadUrl: 'https://example.com/cuda-memtest'
      },
      {
        id: 'gpuz',
        name: 'GPU-Z',
        version: 'v2.54.0',
        icon: '📊',
        type: 'free',
        typeText: '免费',
        description: '轻量级显卡信息检测工具，可查看显卡详细参数、传感器数据，是诊断的基础工具。',
        features: ['显卡参数查看', '传感器监控', 'BIOS信息读取', '一键保存报告'],
        downloadUrl: 'https://example.com/gpuz'
      },
      {
        id: 'furmark',
        name: 'FurMark',
        version: 'v1.33.0',
        icon: '🔥',
        type: 'free',
        typeText: '免费',
        description: '显卡烤机测试工具，通过高强度渲染测试显卡稳定性和散热性能。',
        features: ['GPU压力测试', '温度监控', '稳定性测试', '分数对比'],
        downloadUrl: 'https://example.com/furmark'
      },
      {
        id: 'nvflash',
        name: 'NVFlash',
        version: 'v5.790',
        icon: '💿',
        type: 'pro',
        typeText: '专业',
        description: 'NVIDIA显卡BIOS刷写工具，用于修复BIOS损坏、刷写修改版BIOS等高级操作。',
        features: ['BIOS备份/刷写', '设备ID修改', '强制刷写模式', '多卡支持'],
        downloadUrl: 'https://example.com/nvflash'
      }
    ]
  },

  goToGuide(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/tools/guide/guide?id=${id}`
    })
  },

  downloadTool(e) {
    const url = e.currentTarget.dataset.url
    wx.showModal({
      title: '下载提示',
      content: '由于微信小程序限制，无法直接下载文件。请复制链接在浏览器中下载。',
      confirmText: '复制链接',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: url,
            success: () => {
              wx.showToast({
                title: '链接已复制',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  goToExpert() {
    wx.navigateTo({ url: '/pages/expert/expert' })
  }
})

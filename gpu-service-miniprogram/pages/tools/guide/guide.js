Page({
  data: {
    guide: {
      name: '',
      icon: '',
      version: '',
      intro: '',
      steps: [],
      notes: [],
      faqs: []
    }
  },

  onLoad(options) {
    const id = options.id
    const guides = {
      mats: {
        name: 'MATS显存检测',
        icon: '💾',
        version: 'v4.5.2',
        intro: 'MATS(Memory Test System)是一款专业的NVIDIA显卡显存测试工具，通过读写测试检测显存颗粒的物理损坏情况，是显卡维修必备的专业工具。',
        steps: [
          { title: '准备工作', desc: '下载MATS工具，准备一个U盘（至少4GB），将U盘格式化为FAT32格式。关闭电脑杀毒软件。' },
          { title: '制作启动盘', desc: '使用Rufus或UltraISO等工具将MATS镜像写入U盘，制作成可启动的测试U盘。' },
          { title: 'BIOS设置', desc: '将电脑关机，插入制作好的U盘。开机时按F12/DEL键进入BIOS，设置U盘为第一启动项。' },
          { title: '运行测试', desc: '保存BIOS设置并重启，系统会自动进入MATS测试界面。选择对应显卡代数开始测试。' },
          { title: '查看结果', desc: '测试完成后，查看生成的报告文件，显存坏块会以红色标记显示，记录问题颗粒位置。' }
        ],
        notes: [
          '测试过程中请勿断电，否则可能导致显卡损坏',
          '建议在测试前备份重要数据',
          '测试时间根据显存大小而定，通常需要10-30分钟',
          '仅支持NVIDIA显卡，AMD显卡请使用其他工具'
        ],
        faqs: [
          { q: '测试会损坏显卡吗？', a: '正常情况下不会，MATS是只读测试工具。但测试过程中断电可能造成损坏。' },
          { q: '测试报告看不懂怎么办？', a: '可以将报告截图保存，联系我们的专家进行解读。' },
          { q: '支持RTX 40系显卡吗？', a: '最新版本支持RTX 40系显卡，请确保下载最新版本。' }
        ]
      },
      cuda_memtest: {
        name: 'CUDA MemTest',
        icon: '🧪',
        version: 'v2.1.0',
        intro: 'CUDA MemTest是一款基于CUDA的显存压力测试工具，可以长时间运行来测试显存的稳定性和潜在问题。',
        steps: [
          { title: '下载安装', desc: '下载CUDA MemTest并解压到任意目录。确保已安装NVIDIA显卡驱动。' },
          { title: '运行程序', desc: '右键以管理员身份运行cuda_memtest.exe程序。' },
          { title: '设置参数', desc: '选择要测试的GPU（多卡时），设置测试时长和测试模式。' },
          { title: '开始测试', desc: '点击Start开始测试，观察温度和错误计数。' },
          { title: '分析结果', desc: '测试完成后查看结果，如果有错误会显示具体信息。' }
        ],
        notes: [
          '测试时显卡会满载，请注意散热',
          '建议监控显卡温度，超过85度请停止测试',
          '长时间测试可以更好地发现隐性问题'
        ],
        faqs: [
          { q: '测试时出现错误怎么办？', a: '显存可能存在问题，建议联系专业维修人员进行进一步检测。' },
          { q: '可以边玩游戏边测试吗？', a: '不建议，测试会占用全部显存，会影响游戏性能。' }
        ]
      },
      gpuz: {
        name: 'GPU-Z',
        icon: '📊',
        version: 'v2.54.0',
        intro: 'GPU-Z是一款轻量级的显卡信息检测工具，可以查看显卡的详细参数、实时传感器数据，是诊断显卡的基础工具。',
        steps: [
          { title: '下载安装', desc: '下载GPU-Z，运行安装程序或直接运行便携版。' },
          { title: '查看基本信息', desc: '打开GPU-Z，在主界面查看显卡名称、GPU型号、制程、显存等信息。' },
          { title: '查看传感器', desc: '切换到Sensors标签页，查看GPU温度、频率、功耗、显存使用等实时数据。' },
          { title: '保存报告', desc: '点击工具栏的保存按钮，可以将显卡信息保存为图片或文本报告。' }
        ],
        notes: [
          'GPU-Z不会修改任何系统设置，可以安全使用',
          '传感器数据可以帮助判断显卡是否正常工作',
          '对比同款显卡的正常参数可以发现潜在问题'
        ],
        faqs: [
          { q: '为什么显示的信息不准确？', a: '可能是显卡BIOS被修改过，或者使用的是工程样品显卡。' },
          { q: '如何判断显卡是否被刷过BIOS？', a: '可以对比GPU-Z显示的显卡名称和实际型号是否一致。' }
        ]
      },
      furmark: {
        name: 'FurMark',
        icon: '🔥',
        version: 'v1.33.0',
        intro: 'FurMark是一款显卡烤机测试工具，通过高强度渲染测试显卡的稳定性和散热性能，被称为"甜甜圈"。',
        steps: [
          { title: '下载安装', desc: '下载FurMark并安装，安装过程中可以选择是否安装GPU-Z。' },
          { title: '设置参数', desc: '选择分辨率，勾选Fullscreen全屏模式，建议开启Burn-in测试模式。' },
          { title: '开始测试', desc: '点击GPU stress test开始测试，观察画面是否出现异常。' },
          { title: '监控温度', desc: '注意观察GPU温度，正常应在85度以下，超过90度请停止测试。' },
          { title: '结束测试', desc: '点击Stop结束测试，查看最高温度和是否有错误提示。' }
        ],
        notes: [
          '测试时显卡会满载运行，风扇噪音会很大',
          '长时间测试可能加速显卡老化，建议测试15-30分钟即可',
          '如果画面出现花屏或驱动崩溃，说明显卡存在稳定性问题'
        ],
        faqs: [
          { q: '测试时电脑死机了怎么办？', a: '强制关机后重启，降低测试分辨率或检查显卡散热。' },
          { q: '跑分比别人低很多？', a: '可能是显卡功耗被限制，或驱动设置有问题，检查电源模式和驱动设置。' }
        ]
      },
      nvflash: {
        name: 'NVFlash',
        icon: '💿',
        version: 'v5.790',
        intro: 'NVFlash是NVIDIA官方显卡BIOS刷写工具，用于修复BIOS损坏、刷写修改版BIOS等高级操作。使用需谨慎！',
        steps: [
          { title: '准备工作', desc: '下载对应版本的NVFlash，准备正确的BIOS文件。确保有稳定的电源。' },
          { title: '备份原BIOS', desc: '运行"nvflash --save backup.rom"备份当前BIOS。' },
          { title: '刷写BIOS', desc: '运行"nvflash -6 newbios.rom"刷写新BIOS（-6参数强制刷写）。' },
          { title: '重启验证', desc: '刷写完成后重启电脑，验证显卡是否正常工作。' }
        ],
        notes: [
          '⚠️ 刷写BIOS有风险，操作不当可能导致显卡变砖',
          '刷写过程中绝对不能断电',
          '务必先备份原BIOS',
          '确保BIOS文件与显卡型号匹配',
          '建议在专业人士指导下操作'
        ],
        faqs: [
          { q: '刷写失败显卡点不亮了怎么办？', a: '需要使用编程器重新刷写BIOS，建议联系专业维修人员。' },
          { q: '可以刷其他型号的BIOS吗？', a: '不建议，可能导致硬件不匹配，引发各种问题。' }
        ]
      }
    }

    this.setData({
      guide: guides[id] || guides.mats
    })
  },

  goBack() {
    wx.navigateBack()
  },

  downloadTool() {
    wx.showModal({
      title: '下载提示',
      content: '由于微信小程序限制，无法直接下载文件。请复制链接在浏览器中下载。',
      confirmText: '知道了',
      showCancel: false
    })
  }
})

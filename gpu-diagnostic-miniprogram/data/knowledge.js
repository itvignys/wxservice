// GPU维修知识库数据
// 数据来源：英伟达显卡维修问题汇总.xlsx

module.exports = {
  // 问题分类
  categories: ["显示类", "驱动类", "供电与过热", "物理与接口", "显存与核心", "BIOS与固件"],
  
  // 知识库列表
  knowledgeList: [
  {
    "id": 1,
    "category": "显示类",
    "question": "黑屏/无信号",
    "causes": "显卡供电不足、金手指氧化、核心虚焊、显存故障",
    "diagnosis": "重新插拔显卡、清洁金手指、检查供电线",
    "solution": "加焊核心、更换显存、重做BGA",
    "difficulty": "★★★",
    "cost": "中高",
    "successRate": "70-85%"
  },
  {
    "id": 2,
    "category": "显示类",
    "question": "花屏/条纹/色块",
    "causes": "显存损坏、核心故障、显存供电异常",
    "diagnosis": "显存测试软件（MATS）检测坏块",
    "solution": "更换损坏显存芯片、修复供电电路",
    "difficulty": "★★★",
    "cost": "中",
    "successRate": "80-90%"
  },
  {
    "id": 3,
    "category": "显示类",
    "question": "分辨率异常/无法调节",
    "causes": "EDID信息损坏、BIOS故障、驱动问题",
    "diagnosis": "检查显示设置、重装驱动",
    "solution": "重写BIOS、修复EDID芯片",
    "difficulty": "★★",
    "cost": "中",
    "successRate": "85-90%"
  },
  {
    "id": 4,
    "category": "驱动类",
    "question": "设备管理器代码43",
    "causes": "显存虚焊/损坏、核心故障、BIOS问题",
    "diagnosis": "显卡测试软件跑显存测试",
    "solution": "加焊/更换显存、重写BIOS",
    "difficulty": "★★★",
    "cost": "中",
    "successRate": "75-85%"
  },
  {
    "id": 5,
    "category": "驱动类",
    "question": "驱动安装失败/蓝屏",
    "causes": "系统兼容性、显卡硬件故障、旧驱动残留",
    "diagnosis": "安全模式卸载驱动、DDU清理",
    "solution": "修复硬件故障后重装驱动",
    "difficulty": "★★",
    "cost": "低",
    "successRate": "90%+"
  },
  {
    "id": 6,
    "category": "驱动类",
    "question": "显卡不识别/黄色感叹号",
    "causes": "PCIe插槽问题、显卡供电异常、BIOS损坏",
    "diagnosis": "清洁插槽、检查供电",
    "solution": "重写BIOS、修复供电",
    "difficulty": "★★",
    "cost": "中",
    "successRate": "80-85%"
  },
  {
    "id": 7,
    "category": "供电与过热",
    "question": "显卡风扇不转/异响",
    "causes": "风扇轴承损坏、温控策略、风扇供电故障",
    "diagnosis": "检查风扇供电、测试温控",
    "solution": "更换风扇、修复风扇供电电路",
    "difficulty": "★",
    "cost": "低",
    "successRate": "95%+"
  },
  {
    "id": 8,
    "category": "供电与过热",
    "question": "显卡温度过高/降频",
    "causes": "硅脂干涸、散热器积灰、导热垫老化",
    "diagnosis": "测温、清洁散热器",
    "solution": "更换硅脂、清洁散热器、更换导热垫",
    "difficulty": "★",
    "cost": "低",
    "successRate": "95%+"
  },
  {
    "id": 9,
    "category": "供电与过热",
    "question": "显卡冒烟/烧毁",
    "causes": "供电短路、电容击穿、外接供电接反",
    "diagnosis": "目检烧毁痕迹、测量阻值",
    "solution": "更换MOS管、电容、修复供电电路",
    "difficulty": "★★★★",
    "cost": "高",
    "successRate": "<50%"
  },
  {
    "id": 10,
    "category": "物理与接口",
    "question": "金手指烧坏/氧化",
    "causes": "插拔不当、氧化、PCIe插槽短路",
    "diagnosis": "目检金手指状态",
    "solution": "清洁金手指、补焊金手指、更换金手指",
    "difficulty": "★★★",
    "cost": "中",
    "successRate": "70-80%"
  },
  {
    "id": 11,
    "category": "物理与接口",
    "question": "视频接口损坏",
    "causes": "频繁插拔、静电击穿、物理损伤",
    "diagnosis": "测试各接口输出",
    "solution": "更换接口芯片、飞线修复",
    "difficulty": "★★★",
    "cost": "中",
    "successRate": "75-85%"
  },
  {
    "id": 12,
    "category": "物理与接口",
    "question": "显卡PCB弯折/断裂",
    "causes": "散热器过重、运输磕碰、安装不当",
    "diagnosis": "目检PCB完整性",
    "solution": "层板修复、飞线修复断线",
    "difficulty": "★★★★★",
    "cost": "高",
    "successRate": "40-60%"
  },
  {
    "id": 13,
    "category": "显存与核心",
    "question": "显存报错/容量识别异常",
    "causes": "显存颗粒损坏、显存供电不稳",
    "diagnosis": "显存测试软件逐个颗粒检测",
    "solution": "更换损坏显存颗粒",
    "difficulty": "★★★",
    "cost": "中",
    "successRate": "80-90%"
  },
  {
    "id": 14,
    "category": "显存与核心",
    "question": "核心虚焊/脱焊",
    "causes": "长期高温、热胀冷缩、摔落震动",
    "diagnosis": "时亮时不亮、花屏、死机",
    "solution": "BGA重新植球焊接",
    "difficulty": "★★★★",
    "cost": "中高",
    "successRate": "70-85%"
  },
  {
    "id": 15,
    "category": "显存与核心",
    "question": "核心烧毁/短路",
    "causes": "超频过度、供电异常、散热失效",
    "diagnosis": "核心阻值异常、发热严重",
    "solution": "通常无法维修，需更换核心",
    "difficulty": "★★★★★",
    "cost": "高",
    "successRate": "<30%"
  },
  {
    "id": 16,
    "category": "BIOS与固件",
    "question": "BIOS损坏/刷错",
    "causes": "刷写中断、使用错误BIOS",
    "diagnosis": "黑屏但风扇转、不识别显卡",
    "solution": "用编程器重新刷写BIOS、更换BIOS芯片",
    "difficulty": "★★",
    "cost": "中",
    "successRate": "85-95%"
  },
  {
    "id": 17,
    "category": "BIOS与固件",
    "question": "矿卡后遗症",
    "causes": "长期高负载运行导致老化",
    "diagnosis": "显存测试报错、不稳定",
    "solution": "更换老化元件、重做BGA",
    "difficulty": "★★★★",
    "cost": "中高",
    "successRate": "50-70%"
  }
],
  
  // 根据关键词搜索
  searchByKeyword(keyword) {
    if (!keyword) return this.knowledgeList
    const lowerKeyword = keyword.toLowerCase()
    return this.knowledgeList.filter(item => 
      item.question.toLowerCase().includes(lowerKeyword) ||
      item.causes.toLowerCase().includes(lowerKeyword) ||
      item.category.toLowerCase().includes(lowerKeyword)
    )
  },
  
  // 根据分类筛选
  filterByCategory(category) {
    if (!category || category === '全部') return this.knowledgeList
    return this.knowledgeList.filter(item => item.category === category)
  },
  
  // 根据ID获取详情
  getById(id) {
    return this.knowledgeList.find(item => item.id === id)
  },
  
  // 获取分类统计
  getCategoryStats() {
    const stats = {}
    this.knowledgeList.forEach(item => {
      stats[item.category] = (stats[item.category] || 0) + 1
    })
    return stats
  }
}
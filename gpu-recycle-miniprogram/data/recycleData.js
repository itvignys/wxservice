// 回收品类、型号、估价系数等静态数据
// 注：线上数据由后端 /api/recycle/* 接口提供，此文件为前端兜底/快速展示用

// 品类列表
const categories = [
  {
    id: 'gpu_server',
    name: 'GPU服务器',
    icon: '🖥️',
    desc: 'DGX/HGX/AI服务器整机',
    color: '#2BB673',
    hasConfig: true
  },
  {
    id: 'gpu_card',
    name: 'GPU显卡',
    icon: '🎮',
    desc: 'A100/H100/V100等',
    color: '#4A90D9',
    hasConfig: false
  },
  {
    id: 'cpu',
    name: 'CPU处理器',
    icon: '⚙️',
    desc: 'Xeon/EPYC服务器CPU',
    color: '#FF9500',
    hasConfig: false
  },
  {
    id: 'memory',
    name: '内存',
    icon: '📊',
    desc: 'DDR4/DDR5 ECC内存',
    color: '#AF52DE',
    hasConfig: false
  },
  {
    id: 'storage',
    name: '存储设备',
    icon: '💾',
    desc: 'NVMe SSD/HDD',
    color: '#FF3B30',
    hasConfig: false
  }
]

// 型号库（按品类+品牌组织）
// 基础价单位：元
const models = {
  gpu_server: [
    { id: 'dgx_h100', brand: 'NVIDIA', name: 'NVIDIA DGX H100', spec: '8×H100 80GB / 640GB', basePrice: 850000, hot: true },
    { id: 'dgx_a100', brand: 'NVIDIA', name: 'NVIDIA DGX A100', spec: '8×A100 80GB / 640GB', basePrice: 520000, hot: true },
    { id: 'dgx_a100_40', brand: 'NVIDIA', name: 'NVIDIA DGX A100 40GB', spec: '8×A100 40GB / 320GB', basePrice: 380000 },
    { id: 'hgx_h200', brand: 'NVIDIA', name: 'HGX H200', spec: '8×H200 141GB', basePrice: 1200000, hot: true },
    { id: 'hgx_h100', brand: 'NVIDIA', name: 'HGX H100', spec: '8×H100 80GB', basePrice: 780000 },
    { id: 'mi300x_server', brand: 'AMD', name: 'AMD Instinct MI300X 服务器', spec: '8×MI300X 192GB', basePrice: 720000, hot: true },
    { id: 'mi300a_server', brand: 'AMD', name: 'AMD Instinct MI300A 服务器', spec: '8×MI300A 128GB', basePrice: 550000 },
    { id: 'supermicro_h100', brand: '其他', name: 'Supermicro GPU服务器', spec: '8×H100 80GB 通用AI服务器', basePrice: 680000 },
  ],
  gpu_card: [
    { id: 'h100_sxm', brand: 'NVIDIA', name: 'H100 SXM5 80GB', spec: '80GB HBM3 / 700W', basePrice: 95000, hot: true },
    { id: 'h100_pcie', brand: 'NVIDIA', name: 'H100 PCIe 80GB', spec: '80GB HBM3 / 350W', basePrice: 78000, hot: true },
    { id: 'a100_sxm_80', brand: 'NVIDIA', name: 'A100 SXM4 80GB', spec: '80GB HBM2e / 400W', basePrice: 62000, hot: true },
    { id: 'a100_sxm_40', brand: 'NVIDIA', name: 'A100 SXM4 40GB', spec: '40GB HBM2e / 400W', basePrice: 42000 },
    { id: 'a100_pcie_80', brand: 'NVIDIA', name: 'A100 PCIe 80GB', spec: '80GB HBM2e / 300W', basePrice: 55000 },
    { id: 'v100_sxm', brand: 'NVIDIA', name: 'V100 SXM2 32GB', spec: '32GB HBM2 / 300W', basePrice: 18000 },
    { id: 'v100_pcie', brand: 'NVIDIA', name: 'V100 PCIe 16GB', spec: '16GB HBM2 / 250W', basePrice: 9500 },
    { id: 'l40s', brand: 'NVIDIA', name: 'L40S 48GB', spec: '48GB GDDR6 / 350W', basePrice: 38000, hot: true },
    { id: 'a30', brand: 'NVIDIA', name: 'A30 24GB', spec: '24GB HBM2e / 165W', basePrice: 15000 },
    { id: 'a10', brand: 'NVIDIA', name: 'A10 24GB', spec: '24GB GDDR6 / 150W', basePrice: 12000 },
    { id: 'mi300x', brand: 'AMD', name: 'AMD MI300X 192GB', spec: '192GB HBM3 / 750W', basePrice: 88000, hot: true },
    { id: 'mi250x', brand: 'AMD', name: 'AMD MI250X 128GB', spec: '128GB HBM2e / 560W', basePrice: 35000 },
    { id: 'mi210', brand: 'AMD', name: 'AMD MI210 64GB', spec: '64GB HBM2e / 300W', basePrice: 18000 },
  ],
  cpu: [
    { id: 'epyc_9654', brand: 'AMD', name: 'AMD EPYC 9654', spec: '96核/192线程 / Genoa', basePrice: 38000, hot: true },
    { id: 'epyc_9554', brand: 'AMD', name: 'AMD EPYC 9554', spec: '64核/128线程 / Genoa', basePrice: 22000 },
    { id: 'epyc_9474f', brand: 'AMD', name: 'AMD EPYC 9474F', spec: '48核/96线程 / 高频', basePrice: 18000 },
    { id: 'epyc_7763', brand: 'AMD', name: 'AMD EPYC 7763', spec: '64核/128线程 / Milan', basePrice: 15000 },
    { id: 'epyc_7742', brand: 'AMD', name: 'AMD EPYC 7742', spec: '64核/128线程 / Rome', basePrice: 8000 },
    { id: 'xeon_8480', brand: 'Intel', name: 'Intel Xeon 8480', spec: '56核/112线程 / Sapphire Rapids', basePrice: 28000, hot: true },
    { id: 'xeon_8470', brand: 'Intel', name: 'Intel Xeon 8470', spec: '52核/104线程 / Sapphire Rapids', basePrice: 22000 },
    { id: 'xeon_8380', brand: 'Intel', name: 'Intel Xeon 8380', spec: '40核/80线程 / Ice Lake', basePrice: 12000 },
    { id: 'xeon_8280', brand: 'Intel', name: 'Intel Xeon 8280', spec: '28核/56线程 / Cascade Lake', basePrice: 6000 },
    { id: 'xeon_8176', brand: 'Intel', name: 'Intel Xeon 8176', spec: '28核/56线程 / Skylake', basePrice: 4500 },
  ],
  memory: [
    { id: 'ddr5_64g', brand: '其他', name: 'DDR5 64GB ECC RDIMM', spec: 'DDR5-4800 / 64GB', basePrice: 2200 },
    { id: 'ddr5_32g', brand: '其他', name: 'DDR5 32GB ECC RDIMM', spec: 'DDR5-4800 / 32GB', basePrice: 1100 },
    { id: 'ddr4_64g', brand: '其他', name: 'DDR4 64GB ECC LRDIMM', spec: 'DDR4-3200 / 64GB', basePrice: 1200, hot: true },
    { id: 'ddr4_32g', brand: '其他', name: 'DDR4 32GB ECC RDIMM', spec: 'DDR4-3200 / 32GB', basePrice: 550 },
    { id: 'ddr4_16g', brand: '其他', name: 'DDR4 16GB ECC RDIMM', spec: 'DDR4-3200 / 16GB', basePrice: 220 },
  ],
  storage: [
    { id: 'nvme_8t', brand: '其他', name: 'NVMe SSD 8TB', spec: 'U.2 / PCIe 4.0 / 8TB', basePrice: 6800, hot: true },
    { id: 'nvme_4t', brand: '其他', name: 'NVMe SSD 4TB', spec: 'U.2 / PCIe 4.0 / 4TB', basePrice: 3500 },
    { id: 'nvme_2t', brand: '其他', name: 'NVMe SSD 2TB', spec: 'U.2 / PCIe 4.0 / 2TB', basePrice: 1800 },
    { id: 'nvme_1t', brand: '其他', name: 'NVMe SSD 1TB', spec: 'U.2 / PCIe 4.0 / 1TB', basePrice: 800 },
    { id: 'sas_12t', brand: '其他', name: 'SAS HDD 12TB', spec: '12Gbps / 7200rpm / 12TB', basePrice: 1200 },
    { id: 'sas_8t', brand: '其他', name: 'SAS HDD 8TB', spec: '12Gbps / 7200rpm / 8TB', basePrice: 800 },
  ]
}

// 服务器整机配置加价规则（仅 gpu_server 适用）
const serverConfigOptions = {
  cpu: [
    { id: 'epyc_9654', label: 'AMD EPYC 9654 96核', addPrice: 5000 },
    { id: 'epyc_9554', label: 'AMD EPYC 9554 64核', addPrice: 3000 },
    { id: 'xeon_8480', label: 'Intel Xeon 8480 56核', addPrice: 4000 },
    { id: 'xeon_8380', label: 'Intel Xeon 8380 40核', addPrice: 2000 },
    { id: 'dual_epyc', label: '双路 EPYC 9654', addPrice: 10000 },
  ],
  memory: [
    { id: '1tb', label: '1TB DDR5 ECC', addPrice: 8000 },
    { id: '2tb', label: '2TB DDR5 ECC', addPrice: 16000 },
    { id: '512g', label: '512GB DDR5 ECC', addPrice: 4000 },
    { id: '256g', label: '256GB DDR4 ECC', addPrice: 1500 },
  ],
  storage: [
    { id: 'nvme_16t', label: '16TB NVMe SSD', addPrice: 12000 },
    { id: 'nvme_8t', label: '8TB NVMe SSD', addPrice: 6000 },
    { id: 'nvme_4t', label: '4TB NVMe SSD', addPrice: 3000 },
    { id: 'hdd_60t', label: '60TB SAS HDD', addPrice: 5000 },
  ]
}

// 热门型号（首页展示）
const hotModels = [
  ...models.gpu_server.filter(m => m.hot).slice(0, 3),
  ...models.gpu_card.filter(m => m.hot).slice(0, 4),
  ...models.cpu.filter(m => m.hot).slice(0, 1)
]

// 平台承诺
const promises = [
  { icon: '🔍', title: '验机透明', desc: '专业工程师出具验机报告' },
  { icon: '⚡', title: '打款秒到', desc: '确认价格后即时对公打款' },
  { icon: '🛡️', title: '价格保护', desc: '验机报价不低于预估价80%' },
  { icon: '🔐', title: '隐私清除', desc: '回收设备全程数据安全擦除' }
]

// 回收流程步骤
const flowSteps = [
  { icon: '📱', title: '选型号', desc: '选择设备品类和型号' },
  { icon: '✨', title: '选成色', desc: '评估设备新旧程度' },
  { icon: '🚗', title: '选方式', desc: '上门/邮寄/到店自选' },
  { icon: '💰', title: '拿钱', desc: '验机确认即时打款' }
]

// 客服信息
const contactInfo = {
  phone: '13826580396',
  serviceTime: '9:00-21:00',
  company: '杭州秀源智能科技',
  address: '浙江省杭州市'
}

module.exports = {
  categories,
  models,
  serverConfigOptions,
  hotModels,
  promises,
  flowSteps,
  contactInfo
}

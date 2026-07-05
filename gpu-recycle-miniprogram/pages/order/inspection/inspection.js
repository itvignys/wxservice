const { formatPrice, formatTime } = require('../../../utils/util')
const { recycleOrderApi } = require('../../../utils/api')

Page({
  data: {
    orderNo: '',
    report: null,
    inspectionPriceText: ''
  },

  onLoad(options) {
    this.setData({ orderNo: options.orderNo })
    this.loadReport()
  },

  loadReport() {
    recycleOrderApi.getInspection(this.data.orderNo).then((data) => {
      if (data) {
        this.processReport(data)
      } else {
        this.loadMockReport()
      }
    }).catch(() => {
      this.loadMockReport()
    })
  },

  // 演示模式：生成模拟验机报告
  loadMockReport() {
    const records = wx.getStorageSync('recycleRecords') || []
    const order = records.find(r => r.orderNo === this.data.orderNo)

    // 仅验机中及之后状态有报告
    const hasReport = order && ['inspecting', 'price_pending', 'negotiating', 'payment_pending', 'completed'].includes(order.status)
    if (!hasReport) {
      this.setData({ report: null })
      return
    }

    const mockReport = {
      passed: true,
      inspectionPrice: order.inspectionPrice || Math.round((order.estimatedPrice || 0) * 0.92),
      appearance: [
        { name: '外壳', ok: true },
        { name: '接口', ok: true },
        { name: '风扇', ok: true },
        { name: '标签序列号', ok: true }
      ],
      functions: [
        { name: '开机自检', ok: true },
        { name: 'GPU计算测试', ok: true },
        { name: '显存测试', ok: true },
        { name: '温度压力测试', ok: true },
        { name: 'PCIe通信测试', ok: true }
      ],
      configVerify: [
        { name: '型号', value: order.modelName },
        { name: '显存容量', value: order.modelSpec },
        { name: '序列号', value: 'SN' + Math.random().toString(36).substr(2, 12).toUpperCase() }
      ],
      photos: order.images || [],
      conclusion: '设备功能正常，外观无明显损伤，配置与描述一致。验机通过，建议回收价如上所示。',
      inspector: '张工程师',
      inspectTimeText: formatTime(new Date())
    }

    this.processReport(mockReport)
  },

  processReport(data) {
    const report = {
      ...data,
      inspectTimeText: data.inspectTime ? formatTime(data.inspectTime) : data.inspectTimeText || formatTime(new Date())
    }
    this.setData({
      report,
      inspectionPriceText: formatPrice(report.inspectionPrice || 0)
    })
  },

  previewPhoto(e) {
    wx.previewImage({
      current: this.data.report.photos[e.currentTarget.dataset.index],
      urls: this.data.report.photos
    })
  }
})

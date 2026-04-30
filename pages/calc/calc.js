Page({
  data: {
    height: '',
    temperature: '',
    pressure: '',
    density: '',
    speedOfSound: '',
    showResult: false
  },

  onHeightInput(e) {
    this.setData({
      height: e.detail.value
    })
  },

  setHeight(e) {
    const height = e.currentTarget.dataset.height
    this.setData({ height: String(height) })
    this.calculate()
  },

  calculate() {
    const height = parseFloat(this.data.height)

    if (isNaN(height) || height < 0) {
      wx.showToast({
        title: '请输入有效高度',
        icon: 'none'
      })
      return
    }

    if (height > 11000) {
      wx.showToast({
        title: '高度请不超过11000米',
        icon: 'none'
      })
      return
    }

    // 国际标准大气模型参数
    const T0 = 288.15      // 海平面标准温度 (K)
    const P0 = 101325      // 海平面标准气压 (Pa)
    const L = 0.0065       // 温度递减率 (K/m)
    const g = 9.80665      // 重力加速度 (m/s²)
    const M = 0.0289644    // 空气摩尔质量 (kg/mol)
    const R = 8.31447      // 气体常数 (J/(mol·K))
    const gamma = 1.4      // 空气比热比
    const R_specific = 287.058  // 空气比气体常数 (J/(kg·K))

    // 计算温度 (K)
    const T = T0 - L * height

    // 计算气压 (Pa)
    const exponent = (g * M) / (R * L)
    const P = P0 * Math.pow(1 - (L * height) / T0, exponent)

    // 计算空气密度 (kg/m³)
    const rho = (P * M) / (R * T)

    // 计算音速 (m/s) - 1马赫 = 当地音速
    const a = Math.sqrt(gamma * R_specific * T)

    // 转换为常用单位
    const temperatureC = T - 273.15          // K -> °C
    const pressureHPa = P / 100              // Pa -> hPa

    this.setData({
      temperature: temperatureC.toFixed(1),
      pressure: pressureHPa.toFixed(1),
      density: rho.toFixed(4),
      speedOfSound: a.toFixed(1),
      showResult: true
    })
  }
})